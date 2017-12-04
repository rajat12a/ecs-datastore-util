const JsonArchive = require( './JsonArchive-author-id.js' );

const archiveConfig = {
   AUTHOR:{
      kind:'AUTHOR', schema:require( `./schema/AUTHOR.js` ), fileName:'AUTHOR/AUTHOR_ID',
      sortBy:'AUTHOR_ID', minValue:0,
      batchSize:1000, minUpdate:1000,
      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 }
};

var archives = Object.keys( archiveConfig );
for( var i = 0; i < archives.length; i++ ) {
  (function run() {
    var archive = archives[ i ];
    var config = JSON.parse(JSON.stringify(archiveConfig[ archive ]));
    var callback = ( err, updateCount ) => {
      if( err ) {
        console.error( "RUN: " + String( err ) );
      } else {
        console.log(`RUN: complete`);
      }
    };
    if( archive === 'USER_AUTHOR' || archive === 'USER_PRATILIPI' ) {
      for( var j = 4500000000000000; j < 9000000000000000; j+=500000000000000 ) {
        var configSplit = JSON.parse(JSON.stringify(config));
        configSplit.minValue = j;
        configSplit.maxValue = ( j + 500000000000000 );
        configSplit.fileName = configSplit.fileName + `_${configSplit.minValue}_${configSplit.maxValue}`;
        var jsonArchive = new JsonArchive();
        console.log(`${archive + '_' + configSplit.minValue + '_' + configSplit.maxValue}: Taking Backup`);
        jsonArchive.run( (archive + '_' + configSplit.minValue + '_' + configSplit.maxValue), configSplit, callback );
      }
    } else {
      var jsonArchive = new JsonArchive();
      console.log(`${archive}: Taking Backup`);
      jsonArchive.run( archive, config, callback );
    }
  })();
}
