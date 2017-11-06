module.exports = {

  structure:{
    USER_ID:      { type: 'INTEGER',   default: 0 },
    FACEBOOK_ID:    { type: 'STRING',    default: null },
    GOOGLE_ID:      { type: 'STRING',    default: null },
    PASSWORD:     { type: 'STRING',    default: null },
    EMAIL:        { type: 'STRING',    default: null },
    PHONE:        { type: 'STRING',    default: null },
    LANGUAGE:     { type: 'STRING',    default: null },
    VERIFICATION_TOKEN: { type: 'STRING',    default: null },
    STATE:        { type: 'STRING',    default: null },
    CAMPAIGN:     { type: 'STRING',    default: null },
    REFERER:      { type: 'STRING',    default: null },
    SIGN_UP_DATE:   { type: 'TIMESTAMP', default: null },
    SIGN_UP_SOURCE:   { type: 'STRING',    default: null },
    LAST_UPDATED:   { type: 'TIMESTAMP', default: null },
    LAST_EMAILED:   { type: 'TIMESTAMP', default: null },
    FOLLOW_COUNT:   { type: 'INTEGER',   default: 0 },
    _TIMESTAMP_:    { type: 'TIMESTAMP', default: null }

  },
  primaryKey : 'USER_ID'

};
