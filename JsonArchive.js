const fs = require( 'fs' );
const readline = require( 'readline' );
const http = require( 'http' );
const time = require('time');

const storageClient = require( '@google-cloud/storage' );
const datastoreClient = require( './lib/DatastoreUtility.js' );
var storage;
var datastore;


class JsonArchive {

  static init( config ) {
    storage = storageClient({ projectId: config.gcsProjectId }).bucket( config.gcsBucket );
    return this;
  }


  run( kind, config, callback ) {

    this.kind = kind;
    this.config = config;
    this.callback = callback;

    if( fs.existsSync( this.kind ) ) {

      this.readFromFile();

    } else {

      var file = storage.file( this.kind );
      file.exists( ( err, exists ) => {
        if( err ) {
          this.callback( err, null );
        } else if( exists ) {
          console.log( `Downloading ${ this.kind } from GCS ...` );
          file.download( { destination: this.kind }, ( err ) => {

            if( err ) {
              this.callback( err, null );
            } else {
              this.readFromFile();
            }

          });
        } else {
          this.updateFromDataStore( {}, '' );
        }
      });

    }

  }

  readFromFile() {

    var entities = {};
    var lastValue = '';

    readline.createInterface({
      input: fs.createReadStream( this.kind, { encoding: 'utf8' } )
    }).on( 'line', ( line ) => {
      var json = JSON.parse( line );
      entities[ json[ this.config.id ] ] = json;
      if( lastValue < json[ this.config.sortBy ] ) {
        lastValue = json[ this.config.sortBy ];
      }
    }).on( 'close', () => {
      this.updateFromDataStore( entities, lastValue );
    });

  }

  updateFromDataStore( entities, lastValue ) {

    datastore = datastoreClient({ projectId:process.env.GCP_PROJ_ID, resourceType:this.kind });
    var filters = [];
    if( lastValue !== '' )
      filters.push([ this.config.sortBy, 'gt', lastValue ]);
    // TODO: Apply sorting
    datastore.queryResourcesFromDb( this.kind, filters, null, this.config.batchSize ).then( ( updates ) => {
        console.log( `Found ${ updates.length } new additions/updations for ${ this.kind }.` );
        if( updates.length === 0 ) {
          this.callback( null, 0 );
        } else {
          updates.forEach( ( json ) => {
            entities[ json[ this.config.id ] ] = json;
          });
          this.writeToFile( entities, updates.length );
        }
    }).catch( ( err ) => {
      this.callback( err, null );
    });

  }

  writeToFile( entities, updateCount ) {

    var rand = Math.random();
    var updateGcs = ( updateCount < this.config.batchSize ) || ( rand > 0.9 );

    console.log( `${ updateCount } < ${ this.config.batchSize }  || ( ${ rand } > 0.9 ) = ${ updateGcs }`);

    var wStream = fs.createWriteStream( this.kind, { encoding: 'utf8' } );
    var gcsStream = updateGcs ? storage.file( this.kind ).createWriteStream() : null;

    if( updateGcs ) {
      console.log( `Writing ${ Object.keys( entities ).length } ${ this.kind } entities to FS & GCS ...` );
    } else {
      console.log( `Writing ${ Object.keys( entities ).length } ${ this.kind } entities to FS ...` );
    }

    Object.values( entities ).forEach( (json) => {
      var str = JSON.stringify( json );
      wStream.write( str + '\n' );
      if( updateGcs ) {
        gcsStream.write( str + '\n' );
      }
    });

    wStream.end();
    if( updateGcs ) {
      gcsStream.end();
    }


    if( updateGcs ) {

      var date = new time.Date();
      date.setTimezone( 'Asia/Kolkata' );

      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var hour = date.getHours();
      var min = (date.getMinutes()/5 | 0) * 5;

      var timeStampStr = year +
        '-' + (month < 10 ? '0' + month : month) +
        '-' + (day < 10 ? '0' + day : day) +
        '-' + (hour < 10 ? '0' + hour : hour) +
        ':' + (min < 10 ? '0' + min : min);

      // Must wait for some time before making a copy as the object is not immediately available
      setTimeout( () => {
        storage.file( this.kind ).copy( this.kind + '/' + timeStampStr );
      }, 15000 ); // 15 seconds

    }

    this.callback( null, updateCount );

  }

}

module.exports = JsonArchive;
