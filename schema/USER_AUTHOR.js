module.exports = {

  structure: {
    USER_AUTHOR_ID:	{ type: 'STRING',    default: null },
    USER_ID:		{ type: 'INTEGER',   default: null },
    AUTHOR_ID:		{ type: 'INTEGER',   default: null },
    FOLLOW_STATE:	{ type: 'STRING',    default: null },
    FOLLOW_DATE:	{ type: 'TIMESTAMP', default: null }
  },

  primaryKey: 'USER_AUTHOR_ID'

};
