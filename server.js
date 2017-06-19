const config = require( './config.js' )[ process.env.STAGE ];


const JsonArchive = require( './JsonArchive.js' ).init({
  gcsProjectId: config.STORAGE_PROJECT,
  gcsBucket: config.STORAGE_BUCKET
});

const jsonArchive = new JsonArchive();


const archiveConfig = {
  PRATILIPI: { id:'PRATILIPI_ID', sortBy:'_TIMESTAMP_', batchSize:1000, minUpdate:100, timeInt:30, minTimeInt:5, maxTimeInt:900, nextRun:new Date().getTime() }
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
