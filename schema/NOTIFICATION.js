module.exports = {

	  structure: {
		      NOTIFICATION_ID:	{ type: 'INTEGER',    default: null },
    		  CREATION_DATE:	{ type: 'TIMESTAMP',   default: null },
    		  SOURCE_ID:	{ type: 'STRING',   default: null },
    		  STATE:	{ type: 'STRING',   default: null },
    		  TYPE:	{ type: 'STRING',   default: null },
		      USER_ID:		{ type: 'INTEGER',   default: null }
		    },

	  primaryKey: 'NOTIFICATION_ID'

};