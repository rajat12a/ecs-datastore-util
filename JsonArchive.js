const fs = require( 'fs' );
const readline = require( 'readline' );
const http = require( 'http' );
const time = require( 'time' );

const storageClient = require( '@google-cloud/storage' );
const datastoreClient = require( './lib/DbUtility.js' );
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
    this.schema = require( `./schema/${ this.kind }.js` );
    datastore = datastoreClient({ projectId:process.env.GCP_PROJ_ID, kind:this.kind, schema:this.schema });
    this.boost = config.boost;

    if( fs.existsSync( this.kind ) ) {

      this.readFromFile();

    } else {

      var file = storage.file( this.kind );

      file.exists( ( err, exists ) => {
        if( err ) {
          this.callback( err, null );
        } else if( exists ) {
          console.log( `${ this.kind }: Downloading archive from GCS ...` );
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
    var minValue = '';

    readline.createInterface({
      input: fs.createReadStream( this.kind, { encoding: 'utf8' } )
    }).on( 'line', ( line ) => {
      var json = JSON.parse( line );
      entities[ json[ this.schema.primaryKey ] ] = json;
      if( minValue < json[ this.config.sortBy ] )
        minValue = json[ this.config.sortBy ];
    }).on( 'close', () => {
      console.log( `${ this.kind }: ${ Object.keys( entities ).length } entities read from file system.` );
      this.config.minValue = new Date( minValue );
      this.updateFromDataStore( entities );
    });

  }


  updateFromDataStore( entities ) {

    var filter = [];
    filter.push([ this.config.sortBy, '>=', new Date( this.config.minValue ) ]);
    if( this.config.maxValue != null )
      filter.push([ this.config.sortBy, '<', new Date( this.config.maxValue ) ]);
    var orderBy = [ this.config.sortBy ];

    datastore.query( filter, null, null, this.config.batchSize, orderBy ).then( ( updates ) => {
      console.log( `${ this.kind }: Found ${ updates.data.length } new additions/updations.` );
      if( updates.data.length === 0 ) {
        this.callback( null, 0 );
      } else {
        updates.data.forEach( ( json ) => {
          // HACK
          if( this.kind == 'PRATILIPI' ) {
            json.TAG_IDS = JSON.stringify( json.TAG_IDS );
            json.SUGGESTED_TAGS = JSON.stringify( json.SUGGESTED_TAGS );
          }
          // HACK
          if( this.kind == 'USER_PRATILIPI' ) {
            json[ 'REVIEW_LENGTH' ] = json.REVIEW == null ? 0 : json.REVIEW.length;
            delete( json.REVIEW );
          }
          if( this.config.minValue < json[ this.config.sortBy ] )
            this.config.minValue = json[ this.config.sortBy ];
          entities[ json[ this.schema.primaryKey ] ] = json;
        });
        this.writeToFile( entities, updates.data.length );
      }
    }).catch( ( err ) => {
      this.callback( err, null );
    });

  }


  writeToFile( entities, updateCount ) {

    if( updateCount === this.config.batchSize && this.boost > 1 ) {
      this.boost--;
      console.log( `${ this.kind }: Bosting ... ${ this.boost }` );
      this.updateFromDataStore( entities );
      return;
    }

    if( this.config.boost > 1 )
      updateCount = updateCount + ( this.config.boost - this.boost ) * this.config.batchSize;


    var wStream = fs.createWriteStream( this.kind, { encoding: 'utf8' } );
    var gcsStream = storage.file( this.kind ).createWriteStream();

    console.log( `${ this.kind }: Writing ${ Object.keys( entities ).length } entities with ${ updateCount } updates to FS & GCS ...` );

    Object.values( entities ).forEach( (json) => {
      var str = JSON.stringify( json );
      wStream.write( str + '\n' );
      gcsStream.write( str + '\n' );
    });

    wStream.end();
    gcsStream.end();


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
    }, 60000 ); // 60 seconds


    this.callback( null, updateCount );

  }

}


module.exports = JsonArchive;

