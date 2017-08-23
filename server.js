const JsonArchive = require( './JsonArchive.js' );

const archiveConfig = {
  USER_AUTHOR:{
      kind:'USER_AUTHOR', schema:require( `./schema/USER_AUTHOR.js` ), fileName:'USER_AUTHOR',
      sortBy:'USER_AUTHOR_ID', minValue:'0',
      batchSize:1000, minUpdate:1000,
      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
  USER_PRATILIPI_0_4:{
      kind:'USER_PRATILIPI', schema:require( `./schema/USER_PRATILIPI.js` ), fileName:'USER_PRATILIPI_0_4',
      sortBy:'USER_PRATILIPI_ID', minValue:'0', maxValue:'4',
      batchSize:1000, minUpdate:1000,
      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
  USER_PRATILIPI_4_5:{
      kind:'USER_PRATILIPI', schema:require( `./schema/USER_PRATILIPI.js` ), fileName:'USER_PRATILIPI_4_5',
      sortBy:'USER_PRATILIPI_ID', minValue:'4', maxValue:'5',
      batchSize:1000, minUpdate:1000,
      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
  USER_PRATILIPI_5_6:{
      kind:'USER_PRATILIPI', schema:require( `./schema/USER_PRATILIPI.js` ), fileName:'USER_PRATILIPI_5_6',
      sortBy:'USER_PRATILIPI_ID', minValue:'5', maxValue:'6',
      batchSize:1000, minUpdate:1000,
      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
  USER_PRATILIPI_6_7:{
      kind:'USER_PRATILIPI', schema:require( `./schema/USER_PRATILIPI.js` ), fileName:'USER_PRATILIPI_6_7',
      sortBy:'USER_PRATILIPI_ID', minValue:'6', maxValue:'7',
      batchSize:1000, minUpdate:1000,
      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
  USER_PRATILIPI_7_9:{
      kind:'USER_PRATILIPI', schema:require( `./schema/USER_PRATILIPI.js` ), fileName:'USER_PRATILIPI_7_9',
      sortBy:'USER_PRATILIPI_ID', minValue:'7', maxValue:'9',
      batchSize:1000, minUpdate:1000,
      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
  VOTE:{
      kind:'VOTE', schema:require( `./schema/VOTE.js` ), fileName:'VOTE',
      sortBy:'VOTE_ID', minValue:'0',
      batchSize:1000, minUpdate:1000,
      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 },
  COMMENT:{
      kind:'COMMENT', schema:require( `./schema/COMMENT.js` ), fileName:'COMMENT',
      sortBy:'COMMENT_ID', minValue:1,
      batchSize:1000, minUpdate:1000,
      timeInt:900, minTimeInt:300, maxTimeInt:3600, nextRun:0, boost:1000000 }
};

var archives = Object.keys( archiveConfig );
// var jsonArchive = [];
for( var i = 0; i < archives.length; i++ ) {
  (function run() {
    var jsonArchive = new JsonArchive();
    // var jsonArchive2 = new JsonArchive();
    // var jsonArchive3 = new JsonArchive();
    // var jsonArchive4 = new JsonArchive();
    // var jsonArchive5 = new JsonArchive();
    // var jsonArchive6 = new JsonArchive();
    // var jsonArchive7 = new JsonArchive();
    // var jsonArchive8 = new JsonArchive();
    var archive = archives[ i ];
    var config = archiveConfig[ archive ];
    // var archive2 = archives[ 1 ];
    // var config2 = archiveConfig[ archive2 ];
    // var archive3 = archives[ 2 ];
    // var config3 = archiveConfig[ archive3 ];
    // var archive4 = archives[ 3 ];
    // var config4 = archiveConfig[ archive4 ];
    // var archive5 = archives[ 4 ];
    // var config5 = archiveConfig[ archive5 ];
    // var archive6 = archives[ 5 ];
    // var config6 = archiveConfig[ archive6 ];
    // var archive7 = archives[ 6 ];
    // var config7 = archiveConfig[ archive7 ];
    // var archive8 = archives[ 7 ];
    // var config8 = archiveConfig[ archive8 ];

    var callback = ( err, updateCount ) => {
      if( err ) {
        console.error( "RUN: " + String( err ) );
      } else {
        console.log(`RUN: complete`);
      }
    };

    console.log(`${archive}: Taking Backup`);
    jsonArchive.run( archive, config, callback );
    // console.log(`${archive}: Taking Backup`);
    // jsonArchive2.run( archive2, config2, callback );
    // console.log(`${archive}: Taking Backup`);
    // jsonArchive3.run( archive3, config3, callback );
    // console.log(`${archive}: Taking Backup`);
    // jsonArchive4.run( archive4, config4, callback );
    // console.log(`${archive}: Taking Backup`);
    // jsonArchive5.run( archive5, config5, callback );
    // console.log(`${archive}: Taking Backup`);
    // jsonArchive6.run( archive6, config6, callback );
    // console.log(`${archive}: Taking Backup`);
    // jsonArchive7.run( archive7, config7, callback );
    // console.log(`${archive}: Taking Backup`);
    // jsonArchive8.run( archive8, config8, callback );

  })();
}
