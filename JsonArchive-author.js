const fs = require( 'fs' );
const readline = require( 'readline' );
const tar = require( 'tar' );
var json2csv = require('json2csv');

const datastoreClient = require( './DbUtility.js' );


class JsonArchive {


  run( archive, config, callback ) {
    this.startTime = Date.now();
    this.archive = archive;
    this.config = config;
    this.callback = callback;
    this.datastore = datastoreClient({ projectId:'prod-pratilipi', kind:config.kind, schema:config.schema });
    this.boost = config.boost;
    this.cursor = null;
    console.log(`${this.archive}: Calling Datastore.`);
    this.updateFromDataStore( {} );
  }

  updateFromDataStore( entities ) {

    console.log(`${this.archive}: Querying.`);
    var filter = [];

//    filter.push([ "REVIEW_DATE", '>', null ]);
    filter.push([ this.config.sortBy, '>', this.config.minValue ]);
    if( this.config.maxValue != null ) {
      filter.push([ this.config.sortBy, '<', this.config.maxValue ]);
    }
    this.datastore.query( filter, null, this.cursor, this.config.batchSize, null, null ).then( ( updates ) => {
      console.log( `${ this.archive }: Found ${ updates.data.length } new additions/updations.` );
      if( updates.data.length < 1 ) {
        this.callback( null, updates.data.length );
      } else {
//	this.cursor = updates.endCursor;
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

    console.log( `${ this.archive }: Writing to FS ...` );
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
     var str = JSON.parse( JSON.stringify(json) );
     str = this.jsonToString( str,keys );
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
        var tempArchive = this.archive;
        var tempCallback = this.callback;
	var startTime = this.startTime;
	var diff = Date.now() - startTime;
        console.log( `${tempArchive }: Completed in ${diff}milliseconds or ${diff/1000}seconds or ${diff/60000 }minutes` );
        tempCallback(null,updateCount);
      });
    });
  }

  jsonToString( json, keys ) {
//   for( var i = 0; i < keys.length; i++ ) {
//     if(typeof json[keys[i]] === "boolean" && json[keys[i]] ){
//       json[keys[i]] = 1;
//     } else {
//       json[keys[i]] = 0;
//     }
//       json[keys[i]] = JSON.stringify(json[keys[i]]);
//   }
    const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
    const csvStringifier = createCsvStringifier({
      header: keys
    });
  
    const records = [
      json
    ];
   
    return csvStringifier.stringifyRecords(records)
//	  var csv = json2csv({ data: json, fields: keys });
//	return csv;
  }

}


module.exports = JsonArchive;
