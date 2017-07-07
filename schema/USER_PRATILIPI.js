module.exports = {

  structure: {
    USER_PRATILIPI_ID:	{ type: 'STRING',    default: null },
    USER_ID:		{ type: 'INTEGER',   default: null },
    PRATILIPI_ID:	{ type: 'INTEGER',   default: null },
    LAST_OPENED_PAGE:	{ type: 'STRING',    default: null },
    LAST_OPENED_DATE:	{ type: 'TIMESTAMP', default: null },
    ADDED_TO_LIB:	{ type: 'BOOLEAN',   default: null },
    ADDED_TO_LIB_DATE:	{ type: 'TIMESTAMP', default: null },
    RATING:		{ type: 'INTEGER',   default: null },
    RATING_DATE:	{ type: 'TIMESTAMP', default: null },
    REVIEW_TITLE:	{ type: 'STRING',    default: null },
    REVIEW:		{ type: 'STRING',    default: null },
    REVIEW_STATE:	{ type: 'STRING',    default: null },
    REVIEW_DATE:	{ type: 'TIMESTAMP', default: null },
    COMMENT_COUNT:	{ type: 'INTEGER',   default: null },
    _TIMESTAMP_:	{ type: 'TIMESTAMP', default: null }
  },

  primaryKey: 'USER_PRATILIPI_ID'

};
