module.exports = {

  structure:{
    VOTE_ID:		{ type: 'STRING',    default: null },
    USER_ID:		{ type: 'INTEGER',   default: 0 },
    PARENT_TYPE:	{ type: 'STRING',    default: null },
    PARENT_ID:		{ type: 'STRING',    default: null },
    REFERENCE_TYPE:	{ type: 'STRING',    default: null },
    REFERENCE_ID:	{ type: 'STRING',    default: null },
    TYPE:		{ type: 'STRING',    default: null },
    CREATION_DATE:	{ type: 'TIMESTAMP', default: null },
    LAST_UPDATED:	{ type: 'TIMESTAMP', default: null }
  },
  primaryKey : 'VOTE_ID'

};
