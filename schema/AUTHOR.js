module.exports = {

  structure: {
    AUTHOR_ID:                  { type: 'INTEGER',   default: null },
    USER_ID:                    { type: 'INTEGER',   default: null },
    FIRST_NAME:                 { type: 'STRING',    default: null },
    LAST_NAME:                  { type: 'STRING',    default: null },
    PEN_NAME:                   { type: 'STRING',    default: null },
    FIRST_NAME_EN:              { type: 'STRING',    default: null },
    LAST_NAME_EN:               { type: 'STRING',    default: null },
    PEN_NAME_EN:                { type: 'STRING',    default: null },

    GENDER:                     { type: 'STRING',    default: null },
    DATE_OF_BIRTH:              { type: 'STRING',    default: null },
    LANGUAGE:                   { type: 'STRING',    default: null },
    LOCATION:                   { type: 'STRING',    default: null },

    PROFILE_FACEBOOK:           { type: 'STRING',    default: null },
    PROFILE_TWITTER:            { type: 'STRING',    default: null },
    PROFILE_GOOGLE_PLUS:        { type: 'STRING',    default: null },
    
    SUMMARY:                    { type: 'STRING',    default: null },
    STATE:                      { type: 'STRING',    default: null },
    PROFILE_IMAGE:              { type: 'STRING',    default: null },
    COVER_IMAGE:                { type: 'STRING',    default: null },
    
    REGISTRATION_DATE:          { type: 'TIMESTAMP', default: null },
    LAST_UPDATED:               { type: 'TIMESTAMP', default: null },
    
    FOLLOW_COUNT:               { type: 'INTEGER',   default: 0    },
    CONTENT_DRAFTED:            { type: 'INTEGER',   default: 0    },
    CONTENT_PUBLISHED:          { type: 'INTEGER',   default: 0    },
    TOTAL_READ_COUNT:           { type: 'INTEGER',   default: 0    },
    TOTAL_FB_LIKE_SHARE_COUNT:  { type: 'INTEGER',   default: 0    },
    
    _TIMESTAMP_:                { type: 'TIMESTAMP', default: null } 
  },

  primaryKey: 'AUTHOR_ID'

};
