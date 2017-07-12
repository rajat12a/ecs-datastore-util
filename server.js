const config = require( './config.js' )[ process.env.STAGE ];


const JsonArchive = require( './JsonArchive.js' ).init({
  gcsProjectId: config.STORAGE_PROJECT,
  gcsBucket: config.STORAGE_BUCKET
});

const BigqueryArchive = require( './BigqueryArchive.js' ).init({
  gcsProjectId: config.BIGQUERY_PROJECT,
  gcsBqDataset: config.BIGQUERY_DATASET
});

const jsonArchive = new JsonArchive();
const bigqueryArchive = new BigqueryArchive();


const archiveConfig = {
  AUTHOR:         { sortBy:'_TIMESTAMP_', minValue:new Date(0), batchSize:1000, minUpdate: 100, timeInt:60, minTimeInt: 60, maxTimeInt: 900, nextRun:0, boost: 10 },
  PRATILIPI:      { sortBy:'_TIMESTAMP_', minValue:new Date(0), batchSize:1000, minUpdate: 100, timeInt:60, minTimeInt: 60, maxTimeInt: 900, nextRun:0, boost: 10 },
  USER_AUTHOR:    { sortBy:'FOLLOW_DATE', minValue:new Date(0), batchSize:1000, minUpdate:1000, timeInt:60, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:100 },
  USER_PRATILIPI: {
      sortBy:'_TIMESTAMP_', minValue:new Date(1488306600000), maxValue:new Date(1490985000000),
      batchSize:1000, minUpdate:1000,
      timeInt:60, minTimeInt: 15, maxTimeInt:3600, nextRun:0, boost:100 }
};

const bigqueryConfig = {
  AUDIT_LOG: { sortBy:'CREATION_DATE', lastValue: null, batchSize:10, minUpdate:100, timeInt:300, minTimeInt:60, maxTimeInt:900 }
};

(function run() {

  var kinds = Object.keys( archiveConfig );
  for( var i = 0; i < kinds.length; i++ ) {

    var kind = kinds[ i ];
    var config = archiveConfig[ kind ];

    if( config.nextRun > new Date().getTime() ) {
      continue;
    }

    var callback = ( err, updateCount ) => {
      if( err ) {
        console.error( String( err ) );
      } else {
        if( updateCount === config.batchSize ) {
          config.timeInt = Math.max( config.minTimeInt, Math.ceil( config.timeInt / 2 ) );
        } else if( updateCount < config.minUpdate ) {
          config.timeInt = Math.min( config.maxTimeInt, config.timeInt * 2 );
        }
      }
      config.nextRun = new Date().getTime() + config.timeInt * 1000;
      run();
    };

    return jsonArchive.run( kind, config, callback );

  }

  setTimeout( run, 5 * 1000 );

})();

Object.keys( bigqueryConfig ).forEach( ( kind ) => {

  var config = bigqueryConfig[ kind ];

  var callback = ( err, updateCount ) => {
    if( err ) {
      console.error( String( err ) );
    } else {
      if( updateCount === config.batchSize ) {
        config.timeInt = Math.max( config.minTimeInt, Math.ceil( config.timeInt / 2 ) );
      } else if( updateCount < config.minUpdate ) {
        config.timeInt = Math.min( config.maxTimeInt, config.timeInt * 2 );
      }
    }
    setTimeout( () => {
      bigqueryArchive.run( kind, config, callback );
    }, config.timeInt * 1000 );
  };

  setTimeout( () => {
    bigqueryArchive.run( kind, config, callback );
  }, config.timeInt * 1000 );

});
