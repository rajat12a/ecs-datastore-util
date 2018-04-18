const JsonArchive = require( './JsonArchive-blog-post.js' );

const archiveConfig = {
   BLOG_POST:{
      kind:'BLOG_POST', schema:require( `./schema/BLOG_POST.js` ), fileName:'BLOG_POST',
      sortBy:'BLOG_POST_ID', minValue:1,
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
  
    var jsonArchive = new JsonArchive();
    console.log(`${archive}: Taking Backup`);
    jsonArchive.run( archive, config, callback );
  })();
}
