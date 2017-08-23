const fs = require( 'fs' );
const readline = require( 'readline' );
const tar = require( 'tar' );
const AWS = require( 'aws-sdk' );
var s3 = new AWS.S3();


const datastoreClient = require( './DbUtility.js' );


class JsonArchive {


  run( archive, config, callback ) {

    this.archive = archive;
    this.config = config;
    this.callback = callback;
    this.datastore = datastoreClient({ projectId:'prod-pratilipi', kind:config.kind, schema:config.schema });
    this.boost = config.boost;

    
    console.log(`${this.archive}: Calling Datastore.`);
    this.updateFromDataStore( {} );
  }

  updateFromDataStore( entities ) {

    console.log(`${this.archive}: Querying.`);
    var filter = [];
    filter.push([ this.config.sortBy, '>=', this.config.minValue ]);
    if( this.config.maxValue != null ) {
      filter.push([ this.config.sortBy, '<', this.config.maxValue ]);
    }
    // console.log(`${ this.archive }: ${JSON.stringify(datastore)}\n${JSON.stringify(filter)}`);
    this.datastore.query( filter, null, null, this.config.batchSize, null, null ).then( ( updates ) => {
      console.log( `${ this.archive }: Found ${ updates.data.length } new additions/updations.` );
      if( updates.data.length < 1 ) {
        this.callback( null, updates.data.length );
      } else {
        updates.data.forEach( ( json ) => {
          if( this.config.minValue < json[ this.config.sortBy ] ) {
            this.config.minValue = json[ this.config.sortBy ];
          }
          entities[ json[ this.config.schema.primaryKey ] ] = json;
        });
        this.writeToFile( entities, updates.data.length );
      }
    }).catch( ( err ) => {
      this.callback( err, null );
    });

  }


  writeToFile( entities, updateCount ) {

    console.log( `${ this.archive }: Writing to FS & GCS ...` );
    if( updateCount === this.config.batchSize && this.boost > 1 ) {
      this.boost--;
      console.log( `${ this.archive }: Boosting ... ${ this.boost }` );
      this.updateFromDataStore( entities );
      return;
    }

    if( this.config.boost > 1 ) {
      updateCount = updateCount + ( this.config.boost - this.boost ) * this.config.batchSize;
    }

    var wStream = fs.createWriteStream( `${this.config.fileName}.csv`, { encoding: 'utf8' } );
    var keys = Object.keys(this.config.schema.structure);
    wStream.write( keys.toString() + '\n' );
    console.log( `${ this.archive }: Writing ${ Object.keys( entities ).length } entities with ${ updateCount } updates to FS & GCS ...` );

    Object.values( entities ).forEach( (json) => {
      var str = this.jsonToString( json,keys );
      wStream.write( str );
    });
    wStream.on('error', (error) => {
      console.log(`${ this.archive }: error local file write. ${error}`);
    });
    wStream.end();


    wStream.on('finish', () => {
      console.log(`${ this.archive }: All local file writes are now complete.`);

      console.log(`${ this.archive }: Creating tar file.`);
      var b = tar.c( {
        gzip:true,
        file: `${this.config.fileName}.tar.gz`
      },
      [`${this.config.fileName}.csv`] );
      b.then(() => {
        console.log( `${ this.archive }: tar created` );
        console.log( `${ this.archive }: Uploading to AWS S3 Bucket test-rajat2` );
        var pass = fs.createReadStream( `${this.config.fileName}.tar.gz` )
        var params = {
          Bucket: 'test-rajat2',
          Key: `${this.config.fileName}.tar.gz`,
          Body: pass
        };
        var tempArchive = this.archive;
        var tempCallback = this.callback;
        s3.upload( params, function( err, data ) {
          if( err ) {
            console.error(`${ tempArchive }: Error while uploading to AWS S3.\n${ tempArchive }:  ${err} `);
          } else {
            console.log( `${ tempArchive }: Uploaded to AWS S3.` );
          }
          tempCallback(null,updateCount);
        });
      });
    });
  }

  jsonToString( json, keys ) {
  // for( var i = 0; i < keys.length; i++ ) {
  //   if(json[keys[i]] == null){
  //     json[keys[i]] = '\\N';
  //   }
  // }
    const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
    const csvStringifier = createCsvStringifier({
      header: keys
    });
   
    const records = [
      json
    ];
   
    return csvStringifier.stringifyRecords(records)
  }

}


module.exports = JsonArchive;
