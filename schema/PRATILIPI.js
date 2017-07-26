module.exports = {

  structure: {
    PRATILIPI_ID:               { type: 'INTEGER',       'default': null      },
    TITLE:                      { type: 'STRING',        'default': null      },
    TITLE_EN:                   { type: 'STRING',        'default': null      },
    LANGUAGE:                   { type: 'STRING',        'default': 'ENGLISH' },
    AUTHOR_ID:                  { type: 'INTEGER',       'default': null      },
    TAG_IDS:                    { type: 'ARRAY',         'default': []        },
    SUGGESTED_TAGS:             { type: 'ARRAY',         'default': []        },
    SUMMARY:                    { type: 'STRING',        'default': null      },
    PRATILIPI_TYPE:             { type: 'STRING',        'default': null      },
    CONTENT_TYPE:               { type: 'STRING',        'default': null      },
    STATE:                      { type: 'STRING',        'default': null      },
    COVER_IMAGE:                { type: 'BOOLEAN',       'default': null      },

    LISTING_DATE:               { type: 'TIMESTAMP',     'default': null      },
    LAST_UPDATED:               { type: 'TIMESTAMP',     'default': null      },

    WORD_COUNT:                 { type: 'INTEGER',       'default': 0         },
    IMAGE_COUNT:                { type: 'INTEGER',       'default': 0         },
    PAGE_COUNT:                 { type: 'INTEGER',       'default': 0         },
    CHAPTER_COUNT:              { type: 'INTEGER',       'default': 0         },

    REVIEW_COUNT:               { type: 'INTEGER',       'default': 0         },
    RATING_COUNT:               { type: 'INTEGER',       'default': 0         },
    TOTAL_RATING:               { type: 'INTEGER',       'default': 0         },
    READ_COUNT_OFFSET:          { type: 'INTEGER',       'default': 0         },
    READ_COUNT:                 { type: 'INTEGER',       'default': 0         },
    FB_LIKE_SHARE_COUNT_OFFSET: { type: 'INTEGER',       'default': 0         },
    FB_LIKE_SHARE_COUNT:        { type: 'INTEGER',       'default': 0         },

    _TIMESTAMP_:                { type: 'TIMESTAMP',     'default': null      }
  },

  primaryKey: 'PRATILIPI_ID'

};
