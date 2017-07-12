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

    if( this.config.lastValue != null ) {
      this.updateBigqueryFromDatastore();
    } else {
      this.findAndUpdateLastValue();
    }

  }

  findAndUpdateLastValue() {
    var queryStr = `SELECT MAX(${ this.config.sortBy }) as value FROM [${ this.kind }]`;
    bigquery.query( queryStr, (err,rows) => {
      if( !err ) {
        console.log( `${ this.kind }: ${ Object.keys( rows ).length } entities read from Bigquery.` );
        if( rows && rows[0] && rows[0].value ) {
          var lastValue = rows[0].value.value;
          console.log(`${ this.kind }: lastValue queried from Bigquery is ${ lastValue } having type `+ typeof lastValue);
          this.config.lastValue = new Date([ lastValue.slice(0, 10), 'T', lastValue.slice( 11 ), 'Z' ].join(''));
        }
        this.updateBigqueryFromDatastore();
      } else {
        console.error(`${ this.kind }: Error while reading from Bigquery.`);
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
          if( this.config.lastValue < json[ this.config.sortBy ] ) {
            this.config.lastValue = json[ this.config.sortBy ];
          }
          entities[ json[ this.schema.primaryKey ] ] = json;
        });
        this.insertInBigQuery( entities, updates.data.length );
      }
    }).catch( ( err ) => {
      console.error(`${ this.kind }: Error while querying on datastore.`);
      this.callback( err, null );
    });

  }

  insertInBigQuery( entities, updateCount ) {

    console.log( `${ this.kind }: Inserting ${ entities.length } entities with ${ updateCount } updates to BQ.` );

    if( entities.length === 0 ) {
      this.callback( null, 0 );
      return;
    }


    var rows = [];
    entities.forEach( ( entity ) => {
      var insertId;
      insertId = entity[ this.schema.primaryKey ];
      rows.push( { insertId:insertId, json:entity } );
    });

    bigquery.table( this.kind ).insert( rows, { raw: true }, ( err, apiResponse ) => {
      if(err) {
        console.error(`${ this.kind }: Error while inserting In BigQuery`);
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
        this.config.lastValue = new Date(entities[ entities.length -1 ][ this.config.sortBy ]);
        console.log( `${ rows.length } ${ this.kind } records inserted !` );
        this.callback( null, rows.length );
      }
    });
  }
}

module.exports = BigqueryArchive;
