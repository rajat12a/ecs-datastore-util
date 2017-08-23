module.exports = {

  structure: {
    USER_PRATILIPI_ID:	{ type: 'STRING',    default: null },
    USER_ID:		{ type: 'INTEGER',   default: null },
    PRATILIPI_ID:	{ type: 'INTEGER',   default: null },
    RATING:		{ type: 'INTEGER',   default: null },
    RATING_DATE:	{ type: 'TIMESTAMP', default: null },
    REVIEW:		{ type: 'STRING',    default: null },
    REVIEW_STATE:	{ type: 'STRING',    default: null },
    REVIEW_DATE:	{ type: 'TIMESTAMP', default: null },
    _TIMESTAMP_:	{ type: 'TIMESTAMP', default: null }
  },

  primaryKey: 'USER_PRATILIPI_ID'

};
