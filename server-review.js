const JsonArchive = require( './JsonArchive-review.js' );

const archiveConfig = {
//  USER_AUTHOR:{
 //     kind:'USER_AUTHOR', schema:require( `./schema/USER_AUTHOR.js` ), fileName:'USER_AUTHOR/USER_AUTHOR',
   //   sortBy:'USER_AUTHOR_ID',
     // batchSize:1000, minUpdate:1000,
     // timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
  // USER_PRATILIPI_0_4:{
  //     kind:'USER_PRATILIPI', schema:require( `./schema/USER_PRATILIPI.js` ), fileName:'USER_PRATILIPI_0_4',
  //     sortBy:'USER_PRATILIPI_ID', minValue:'0', maxValue:'4',
  //     batchSize:1000, minUpdate:1000,
  //     timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
  // USER_PRATILIPI_4_5:{
  //     kind:'USER_PRATILIPI', schema:require( `./schema/USER_PRATILIPI.js` ), fileName:'USER_PRATILIPI_4_5',
  //     sortBy:'USER_PRATILIPI_ID', minValue:'4', maxValue:'5',
  //     batchSize:1000, minUpdate:1000,
  //     timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
  // USER_PRATILIPI_5_6:{
  //     kind:'USER_PRATILIPI', schema:require( `./schema/USER_PRATILIPI.js` ), fileName:'USER_PRATILIPI_5_6',
  //     sortBy:'USER_PRATILIPI_ID', minValue:'5', maxValue:'6',
  //     batchSize:1000, minUpdate:1000,
  //     timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
  // USER_PRATILIPI_6_7:{
  //     kind:'USER_PRATILIPI', schema:require( `./schema/USER_PRATILIPI.js` ), fileName:'USER_PRATILIPI_6_7',
  //     sortBy:'USER_PRATILIPI_ID', minValue:'6', maxValue:'7',
  //     batchSize:1000, minUpdate:1000,
  //     timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
  // USER_PRATILIPI_7_9:{
  //     kind:'USER_PRATILIPI', schema:require( `./schema/USER_PRATILIPI.js` ), fileName:'USER_PRATILIPI_7_9',
  //     sortBy:'USER_PRATILIPI_ID', minValue:'7', maxValue:'9',
  //     batchSize:1000, minUpdate:1000,
  //     timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
   USER_PRATILIPI_REVIEW:{
    kind:'USER_PRATILIPI', schema:require( `./schema/USER_PRATILIPI.js` ), fileName:'USER_PRATILIPI/USER_PRATILIPI_REVIEW',
      sortBy:'USER_PRATILIPI_ID', minValue:'0',
      batchSize:1000, minUpdate:1000,
      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 }//,
//   VOTE:{
//      kind:'VOTE', schema:require( `./schema/VOTE.js` ), fileName:'VOTE',
//      sortBy:'VOTE_ID', minValue:'0',
//      batchSize:1000, minUpdate:1000,
//      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
//   COMMENT:{
//      kind:'COMMENT', schema:require( `./schema/COMMENT.js` ), fileName:'COMMENT',
//      sortBy:'COMMENT_ID', minValue:1,
//      batchSize:1000, minUpdate:1000,
//      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 }
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
      for( var j = 40; j < 80; j++ ) {
        var configSplit = JSON.parse(JSON.stringify(config));
        configSplit.minValue = "" + j;
        configSplit.maxValue = "" + ( j + 1 );
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
