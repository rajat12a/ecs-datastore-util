module.exports = {

  structure:{
    PAGE_ID:		{ type: 'INTEGER',    default: null },
    PAGE_TYPE:		{ type: 'STRING',   default: null },
    PRIMARY_CONTENT_ID:	{ type: 'INTEGER',    default: null },
    URI:		{ type: 'STRING',    default: null },
    URI_ALIAS:		{ type: 'STRING',    default: null }
  },
  primaryKey : 'PAGE_ID'

};
