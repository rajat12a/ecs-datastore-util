module.exports = {

  structure:{

    AUDIT_LOG_ID:		    { type: 'INTEGER',   default: 0 },
    USER_ID:			      { type: 'INTEGER',   default: 0 },
    ACCESS_ID:			    { type: 'STRING',    default: null },
    ACCESS_TYPE:		    { type: 'STRING',    default: null },
    PRIMARY_CONTENT_ID: { type: 'STRING',    default: null },
    EVENT_DATA_OLD:		  { type: 'STRING',    default: null },
    EVENT_DATA_NEW:		  { type: 'STRING',    default: null },
    EVENT_COMMENT:		  { type: 'STRING',    default: null },
    CREATION_DATE:		  { type: 'TIMESTAMP', default: null },
    CLIENT_TYPE:		  { type: 'STRING',    default: null },
    CLIENT_VERSION:		  { type: 'STRING',    default: null }

  },
  primaryKey : 'AUDIT_LOG_ID'

};
