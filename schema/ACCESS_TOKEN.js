module.exports = {

	  structure: {
		      ACCESS_TOKEN_ID:	{ type: 'STRING',    default: null },
		      CREATION_DATE:	{ type: 'TIMESTAMP',    default: null },
    		  FCM_TOKEN:	{ type: 'STRING',   default: null },
		      USER_ID:		{ type: 'INTEGER',   default: null }
		    },

	  primaryKey: 'ACCESS_TOKEN_ID'

};