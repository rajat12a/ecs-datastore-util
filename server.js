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
  USER:{
      kind:'USER', schema:require( `./schema/USER.js` ), fileName:'USER',
      sortBy:'_TIMESTAMP_', minValue:new Date(0),
      batchSize:1000, minUpdate: 100,
      timeInt:900, minTimeInt:300, maxTimeInt: 900, nextRun:0, boost: 10 },
  AUTHOR:{
      kind:'AUTHOR', schema:require( `./schema/AUTHOR.js` ), fileName:'AUTHOR',
      sortBy:'_TIMESTAMP_', minValue:new Date(0),
      batchSize:1000, minUpdate: 100,
      timeInt:900, minTimeInt:300, maxTimeInt: 900, nextRun:0, boost: 10 },
  PRATILIPI:{
      kind:'PRATILIPI', schema:require( `./schema/PRATILIPI.js` ), fileName:'PRATILIPI',
      sortBy:'_TIMESTAMP_', minValue:new Date(0),
      batchSize:1000, minUpdate: 100,
      timeInt:900, minTimeInt:300, maxTimeInt: 900, nextRun:0, boost: 10 },
  USER_AUTHOR:{
      kind:'USER_AUTHOR', schema:require( `./schema/USER_AUTHOR.js` ), fileName:'USER_AUTHOR',
      sortBy:'FOLLOW_DATE', minValue:new Date(0),
      batchSize:1000, minUpdate:1000,
      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:100 },
  USER_PRATILIPI_201707:{
      kind:'USER_PRATILIPI', schema:require( `./schema/USER_PRATILIPI.js` ), fileName:'USER_PRATILIPI-2017.07',
      sortBy:'_TIMESTAMP_', minValue:new Date(1498847400000), maxValue:new Date(1501525800000),
      batchSize:1000, minUpdate:1000,
      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:100 },
  USER_PRATILIPI_201708:{
      kind:'USER_PRATILIPI', schema:require( `./schema/USER_PRATILIPI.js` ), fileName:'USER_PRATILIPI-2017.08',
      sortBy:'_TIMESTAMP_', minValue:new Date(1501525800000), maxValue:new Date(1504204200000),
      batchSize:1000, minUpdate:1000,
      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:100 }
};

const bigqueryConfig = {
  AUDIT_LOG: {
    kind:'AUDIT_LOG',
    schema:require( `./schema/AUDIT_LOG.js` ),
    sortBy:'CREATION_DATE',
    lastValue:null,
    batchSize:1000,
    minUpdate:100,
    timeInt:60,
    minTimeInt:60,
    maxTimeInt:900,
    nextRun:0
  }
};


(function run() {

  var archives = Object.keys( archiveConfig );
  for( var i = 0; i < archives.length; i++ ) {

    var archive = archives[ i ];
    var config = archiveConfig[ archive ];

    if( config.nextRun > new Date().getTime() ) {
      continue;
    }

    var callback = ( err, updateCount ) => {
      if( err ) {
        console.error( archive + ": " + String( err ) );
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

    return jsonArchive.run( archive, config, callback );

  }

  setTimeout( run, 5 * 1000 );

})();


( function bigQueryRun() {
  var bigQueries = Object.keys( bigqueryConfig );
  for( var i = 0; i < bigQueries.length; i++ ) {

    var bigQuery = bigQueries[ i ];
    var config = bigqueryConfig[ bigQuery ];

    if( config.nextRun > new Date().getTime() ) {
      continue;
    }

    var callback = ( err, updateCount ) => {
      if( err ) {
        console.error( bigQuery + ": " + String( err ) );
      } else {
        if( updateCount === config.batchSize ) {
          config.timeInt = Math.max( config.minTimeInt, Math.ceil( config.timeInt / 2 ) );
        } else if( updateCount < config.minUpdate ) {
          config.timeInt = Math.min( config.maxTimeInt, config.timeInt * 2 );
        }
      }
      config.nextRun = new Date().getTime() + config.timeInt * 1000;
      bigQueryRun();
      };

    return bigqueryArchive.run( bigQuery, config, callback );
  }

  setTimeout( bigQueryRun, 5 * 1000 );
} )();
