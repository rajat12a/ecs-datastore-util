module.exports = {

	  structure: {
		      BLOG_POST_ID:	{ type: 'INTEGER',    default: null },
		      BLOG_ID:	{ type: 'INTEGER',   default: null },
    		  CREATED_BY:	{ type: 'INTEGER',   default: null },
    		  CREATION_DATE:	{ type: 'TIMESTAMP', default: null },
    		  LANGUAGE:	{ type: 'STRING',   default: null },
    		  LAST_UPDATED:	{ type: 'TIMESTAMP', default: null },
    		  STATE:	{ type: 'STRING',   default: null },
    		  TITLE:	{ type: 'STRING',   default: null },
    		  TITLE_EN:	{ type: 'STRING',   default: null },
    		  CONTENT:	{ type: 'STRING',   default: null }
		    },

	  primaryKey: 'BLOG_POST_ID'

};
