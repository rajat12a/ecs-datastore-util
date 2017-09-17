const bigqueryClient = require( '@google-cloud/bigquery' );
const datastoreClient = require( './lib/DbUtility.js' );

var bigquery;

const http = require( 'http' );

class BigqueryArchive {

  static init( config ) {
    bigquery = bigqueryClient({ projectId: config.gcsProjectId }).dataset( config.gcsBqDataset );
    return this;
  }

  run( bigQuery, config, callback ) {

    this.bigQuery = bigQuery;
    this.kind = config.kind;
    this.config = config;
    this.callback = callback;
    this.schema = config.schema;
    this.datastore = datastoreClient({ projectId:process.env.GCP_PROJ_ID, kind:this.kind, schema:this.schema });

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
        if( rows && rows[0] && rows[0].value ) {
          var lastValue = rows[0].value.value;
          this.config.lastValue = new Date([ lastValue.slice(0, 10), 'T', lastValue.slice( 11 ), 'Z' ].join(''));
          console.log( `${ this.kind }: lastValue read from Bigquery is ${ this.config.lastValue }.` );
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
    var entities={};
    console.log( `${ this.kind }: lastValue after which entities needs to be fetched from Datastore is ${ this.config.lastValue }.` );
    if( this.config.lastValue != null ) {
      filter.push([ this.config.sortBy, '>=', new Date( this.config.lastValue ) ]);
    }
    var orderBy = [ this.config.sortBy ];

    this.datastore.query( filter, null, null, this.config.batchSize, orderBy ).then( ( updates ) => {
      console.log( `${ this.kind }: Found ${ updates.data.length } new additions/updations.` );
      if( updates.data.length <= 1 ) {
        this.callback( null, updates.data.length );
      } else {
        var firstEntity = updates.data.splice( 0, 1 );
        console.log( `${ this.kind }: Removed First Entity ` + JSON.stringify( firstEntity ) );
        this.insertInBigQuery( updates.data, updates.data.length );
      }
    }).catch( ( err ) => {
      console.error(`${ this.kind }: Error while querying on datastore.`);
      this.callback( err, null );
    });

  }

  insertInBigQuery( entities, updateCount ) {

    console.log( `${ this.kind }: Inserting ${ entities.length } entities to BQ.` );


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
                console.error( JSON.stringify( err2.reason ) );
                console.error( JSON.stringify( err2.debugInfo ) );
                console.error( JSON.stringify( err2.message ) );
              }
            });
          });
        } else if( err.message === 'Request payload size exceeds the limit: 10485760 bytes.') {
          this.config.batchSize = Math.max( this.config.batchSize - 25, 1 );
        }
        this.callback( err, null );
      } else {
        this.config.lastValue = new Date(entities[ entities.length -1 ][ this.config.sortBy ]);
        console.log( `${ this.kind }: ${ rows.length } records inserted !` );
        this.config.batchSize = Math.min( this.config.batchSize + 25, 1000 );
        this.callback( null, rows.length );
      }
    });
  }
}

module.exports = BigqueryArchive;
