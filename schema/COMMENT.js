module.exports = {

  structure:{
    COMMENT_ID:		{ type: 'INTEGER',   default: null },
    USER_ID:		{ type: 'INTEGER',   default: 0 },
    PARENT_TYPE:	{ type: 'STRING',    default: null },
    PARENT_ID:		{ type: 'STRING',    default: null },
    STATE:		{ type: 'STRING',    default: null },
    CREATION_DATE:	{ type: 'TIMESTAMP', default: null },
    LAST_UPDATED:	{ type: 'TIMESTAMP', default: null },
    CONTENT:		{ type: 'STRING',    default: null }
  },
  primaryKey : 'COMMENT_ID'

};
