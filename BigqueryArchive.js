const bigqueryClient = require( '@google-cloud/bigquery' );
const datastoreClient = require( './lib/DbUtility.js' );

var datastore;
var bigquery;

const http = require( 'http' );

class BigqueryArchive {

  static init( config ) {
    bigquery = bigqueryClient({ projectId: config.gcsProjectId }).dataset( config.gcsBqDataset );
    return this;
  }

  run( kind, config, callback ) {

    this.kind = kind;
    this.config = config;
    this.callback = callback;
    this.schema = require( `./schema/${ this.kind }.js` );
    datastore = datastoreClient({ projectId:process.env.GCP_PROJ_ID, kind:this.kind, schema:this.schema });

    if( this.config.lastValue !== '' ) {
      this.updateBigqueryFromDatastore();
    } else {
      this.findAndUpdateLastValue();
    }

  }

  findAndUpdateLastValue() {
    var queryStr = `SELECT MAX(${ this.config.sortBy }) as value FROM [${ this.kind }]`;
    bigquery.query( queryStr, (err,rows) => {
      if( !err ) {
        if( rows && rows[0] && rows[0].value ) {
          var lastValue = rows[0].value.value;
          this.config.lastValue = [ lastValue.slice(0, 10), 'T', lastValue.slice( 11 ), 'Z' ].join('');
        }
        this.updateBigqueryFromDatastore();
      } else {
        this.callback( err, null );
      }
    });
  }

  updateBigqueryFromDatastore() {

    var filter = [];
    if( this.config.lastValue !== '' ) {
      filter.push([ this.config.sortBy, '>', new Date( this.config.lastValue ) ]);
    }
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
          if( this.config.lastValue < json[ this.config.sortBy ] ) {
            this.config.lastValue = json[ this.config.sortBy ];
          }
          entities[ json[ this.schema.primaryKey ] ] = json;
        });
        this.insertInBigQuery( entities, updates.data.length );
      }
    }).catch( ( err ) => {
      this.callback( err, null );
    });

  }

  insertInBigQuery( entities, updateCount ) {

    console.log( `Found ${ entities.length } new additions for ${ this.kind }.` );

    if( entities.length === 0 ) {
      this.callback( null, 0 );
      return;
    }


    var rows = [];
    entities.forEach( ( entity ) => {
      var insertId;
      insertId = entity[ this.config.id ];
      rows.push( { insertId:insertId, json:entity } );
    });

    bigquery.table( this.kind ).insert( rows, { raw: true }, ( err, apiResponse ) => {
      if(err) {
        if( err.name === 'PartialFailureError' ) {
          err.errors.forEach( ( err1 ) => {
            err1.errors.forEach( ( err2 ) => {
              if( err2.reason !== 'stopped' ) {
                console.error( JSON.stringify( err1.row ) );
                console.error( err2.reason );
                console.error( err2.debugInfo );
                console.error( err2.message );
              }
            });
          });
        }
        this.callback( err );
      } else {
        this.config.lastValue = entities[ entities.length -1 ][ this.config.sortBy ];
        console.log( `${ rows.length } ${ this.kind } records inserted !` );
        this.callback( null, rows.length );
      }
    });
  }
}

module.exports = BigqueryArchive;
