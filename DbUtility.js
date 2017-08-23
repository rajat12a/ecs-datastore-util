//Utility to perform CRUD operation on a DB currently Google Datastore

//EXPORTING THIS UTILITY FOR OTHER FILES TO USE
module.exports = DbUtility;

//GETTING THE GOOGLE DATASTORE LIBRARY TO PERFORM CRUD OPERATIONS
const datastoreModule = require( '@google-cloud/datastore' );

//GETTING THE LODASH LIBRARY TO PERFORM OBJECT AND ARRAY OPERATIONS
const _ = require( 'lodash' );

//THE FUNCTION TO BE EXPORTED
function DbUtility ( config ) {

  //EXTRACT DATA FROM CONFIG OBJECT WHICH IS PASSED FROM CALLING SERVICE
  const kind = config.kind;
  const projectId = config.projectId;
  const schema = config.schema;
  const structure = schema.structure;
  const primaryKey = schema.primaryKey;
  var excludeFromIndexes = schema.excludeFromIndexes || [];
  if( excludeFromIndexes.indexOf( primaryKey ) !== -1 ) {
    excludeFromIndexes[ excludeFromIndexes.indexOf( primaryKey ) ] = '__key__';
  }
  //CREATE A DATASTORE CLIENT FOR A SPECIFIC PROJECT
  const datastoreClient = datastoreModule( { 'projectId' : projectId } );

  //HELPER UTILITY

  const makeFunctions = {
    "BOOLEAN": function( value ) {
      return value;
    },
    "INTEGER": function( value ) {
      if( value !== null && value.constructor.name !== 'Int' ) {
        return datastoreClient.int( value );
      } else {
        return value;
      }
    },
    "ARRAY": function( value ) {
      return value;
    },
    "TIMESTAMP": function( value ) {
      try {
        if( typeof value === 'string' && value === "new Date()" ) {
         return ( new Date() );
        } else if( value === null ) {
         return value;
        } else {
         return new Date( value );
        }
      } catch( error ) {
        return value;
      }
    },
    "FLOAT": function( value ) {
      if( value !== null && value.constructor.name !== 'Double' ) {
        return datastoreClient.double( value );
      } else {
        return value;
      }
    },
    "GEOPOINT": function( value ) {
      if( value !== null && value.constructor.name !== 'GeoPoint' ) {
        return datastoreClient.geoPoint( value );
      } else {
        return value;
      }
    },
    "NULL": function( value ) {
      return value;
    },
    "OBJECT": function( value ){
      return value;
    },
    "STRING": function( value ){
      return value;
    }
  };

  const checkFunctions = {
    "BOOLEAN": function( value ) {
      return ( typeof value === 'boolean' );
    },
    "INTEGER": function( value ) {
      if ( typeof value === 'number' ) {
        if( value % 1 !== 0 ) {
          return false;
        } else {
          return true;
        }
      } else if( value !== null && typeof value === 'object' && value.constructor.name === 'Int' ) {
        if( Number( value.value ) % 1 !== 0 ) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
    "ARRAY": function( value ) {
      return ( Array.isArray( value ) );
    },
    "TIMESTAMP": function( value ) {
      try{
      if ( value !== null && typeof value === 'object' && value.constructor.name === 'Date' ) {
        return ( typeof value.getTime() === 'number' );
      } else {
        return false;
      }
      } catch( error ) {
      return false;
      }
    },
    "FLOAT": function( value ) {
      if ( typeof value === 'number' ) {
        return true;
      } else if( value !== null && typeof value === 'object' && value.constructor.name === 'Double' ) {
        if( typeof value.value === 'number' ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    "GEOPOINT": function( value ) {
      if ( value !== null && typeof value === 'object' && Object.keys( value ).length === 2 ) {
        if( value.latitude !== undefined && value.longitude !== undefined ) {
          return true;
        } else {
          return false;
        }
      } else if ( value !== null && typeof value.value === 'object' && value.constructor.name === 'GeoPoint' && Object.keys( value.value ).length === 2 ) {
        if( value.value.latitude !== undefined && value.value.longitude !== undefined ) {
          return true;
        } else {
          return false;
        } 
      } else {
        return false;
      }
    },
    "NULL": function( value ) {
      return ( value === null );
    },
    "OBJECT": function( value ) {
      return ( value !== null && typeof value === 'object' );
    },
    "STRING": function( value ) {
      return ( typeof value === 'string' );
    }
  };

  function makeData( data ) {
    var newData = [];
    var keyData = Object.keys( data );
    var valueData = Object.values( data );
    for( var i = 0; i < keyData.length; i++ ) {
      var newObject = {};
      newObject.name = keyData[ i ];
      newObject.value = valueData[ i ];
      newObject.excludeFromIndexes = excludeFromIndexes.indexOf( keyData[ i ] ) === -1 ? false : true;
      newData.push( newObject );
    }
    return newData;
  }

  //MAKE A PRIMARY KEY FOR DATASTORE WITH PROVIDED ID NOTE: DATASTORE SPECIFIC
  function getKey( id ) {
    return datastoreClient.key( [ kind, id ] );
  }

  //MAKE A PRIMARY KEY FOR DATASTORE WITHOUT ANY ID NOTE: DATASTORE SPECIFIC
  function getNewKey() {
    return datastoreClient.key( [ kind ] );
  }

  //CONVERT THE STRING TO UPPERCASE
  function toUpperCase( string ) {
    return string.toUpperCase();
  }

  //SORT ENTITYMAP IN THE ORDER OF IDS AND APPEND NULL FOR IDS HAVING NO ENTITY
  function sortEntities( ids, entityMap ) {
    try {
      var entities = [];
      ids.forEach( ( id ) => {
        //IF ID IS STRING THEN TAKE NAME_ID ELSE ID_ID NOTE: DATASTORE SPECIFIC
        if( typeof id === 'string' ) {
          if( entityMap[ 'NAME_' + id ] ) {
            entities.push( entityMap[ 'NAME_' + id ] );
          } else {
            entities.push( null );
          }
        } else {
          if( entityMap[ 'ID_' + id ] ) {
            entities.push( entityMap[ 'ID_' + id ] );
          } else {
            entities.push( null );
          }
        }
      } );
      return entities;
    } catch( error ) {
      throw error;
    }
  }
  //EXECUTE ON EACH ENTITY
  function processEntities( entities ) {
    try {
      entities.forEach( ( entity, index ) => {
        entities[ index ] = processEntity( entity );
      } );
      return entities;
    } catch( error ) {
      throw error;
    }
  }

  //MAKE ENTITY TO SPECIFIED SCHEMA STRUCTURE AND ADD PRIMARY KEY
  function processEntity( entity ) {
    try {
      //MAKE THE ENTITY TO SPECIFIED SCHEMA
      entity = makeSchema( entity );
      entity = removeIntDoubleGeoObjects( entity );
      //EXPLICIT CHECK FOR PRIMARY KEY IN DATASTORE NOTE: DATASTORE SPECIFIC
      if( structure[ primaryKey ].type === 'INTEGER' ) {
        entity[ primaryKey ] = parseInt( entity[ datastoreClient.KEY ].id );
      } else {
        entity[ primaryKey ] = entity[ datastoreClient.KEY ].name;
      }
      return entity;
    } catch( error ) {
      throw error;
    }
  }

  //EXECUTE ON EACH ENTITY
  function processOnlyPrimaryKeys( entities ) {
    try {
      entities.forEach( ( entity, index ) => {
        entities[ index ] = processOnlyPrimaryKey( entity );
      } );
      return entities;
    } catch( error ) {
      throw error;
    }
  }

  //MAKE ENTITY TO SPECIFIED SCHEMA STRUCTURE AND ADD PRIMARY KEY
  function processOnlyPrimaryKey( entity ) {
    try {
      //EXPLICIT CHECK FOR PRIMARY KEY IN DATASTORE NOTE: DATASTORE SPECIFIC
      if( structure[ primaryKey ].type === 'INTEGER' ) {
        entity[ primaryKey ] = parseInt( entity[ datastoreClient.KEY ].id );
      } else {
        entity[ primaryKey ] = entity[ datastoreClient.KEY ].name;
      }
      return entity;
    } catch( error ) {
      throw error;
    }
  }

  //MAKE ENTITY TO SPECIFIED SCHEMA STRUCTURE
  function makeSchema( entity ) {
    try {
      //DELETE EXTRA KEYS FROM MAP WHICH ARE NOT IN SCHEMA STRUCTURE
      Object.keys( entity ).forEach( ( property ) => {
        if( structure[ property ] == null ) {
          delete entity[ property ];
        }
      });
      //ADD NON EXISTING KEYS WITH DEFAULT VALUE
      Object.keys( structure ).forEach( ( property ) => {
        if( entity[ property ] == null ) {
          entity[ property ] = makeFunctions[ structure[ property ].type ]( structure[ property ].default );
        } else {
          entity[ property ] = makeFunctions[ structure[ property ].type ]( entity[ property ] );
        }
      });
      checkSchema( entity );
      return entity;
    } catch( error ) {
      throw error;
    }
  }

  //CHECK IF ENTITY CONFORMS TO THE SCHEMA STRUCTURE
  function checkSchema( entity ) {
    try {
      var keys = Object.keys( entity );
      for(var i = 0; i < keys.length; i++ ) {
        var property = keys[ i ];
        if( structure[ property ] == null ) {
          //WRONG FIELDS PROVIDED NOT CONFORMING TO SCHEMA
          throw new Error( 'DbUtility: Wrong field provided for ' + property + ' having value ' + JSON.stringify( entity[ property ] ) + ' and datatype of value is ' + typeof entity[ property ] + '. It is not in SCHEMA structure provided.' );
        } else if(  !checkFunctions.NULL( entity[ property ] ) && !checkFunctions[ structure[ property ].type ]( entity[ property ] ) ) {
          //WRONG FIELDS PROVIDED NOT CONFORMING TO SCHEMA
          throw new Error( 'DbUtility: Wrong field provided for ' + property + ' having value ' + JSON.stringify( entity[ property ] ) + ' and datatype of value is ' + typeof entity[ property ] + '. It is not according to SCHEMA structure provided.' );
        }
      }
      return true;
    } catch( error ) {
      throw error;
    }
  }

  function removeIntDoubleGeoObjects( entity ) {
    try {
      var keys = Object.keys( entity );
      for(var i = 0; i < keys.length; i++ ) {
        var property = keys[ i ];
        if( entity[ property ] !== null && ( structure[ property ].type === 'INTEGER' || structure[ property ].type === 'FLOAT' ) ) {
          entity[ property ] = Number( entity[ property ].value );
        } else if( entity[ property ] !== null && structure[ property ].type === 'GEOPOINT' ) {
          entity[ property ] = entity[ property ].value;
        }
      }
      return entity;
    } catch( error ) {
      throw error;
    }
  }

  function filterQuery( query, filter ) {
    try {

      //Filter is provided
      if( filter != null ) {
        //Filter should be an array
        if( Array.isArray( filter ) ) {
          for( var i = 0; i < filter.length; i++ ) {
            //Each filter should have three values
            if( Array.isArray( filter[ i ] ) && filter[i].length === 3 ) {
              //HANDLING CASE WHERE FIELDNAMES ARE IN LOWER CASE
              filter[ i ][ 0 ] = filter[ i ][ 0 ].toUpperCase();
              //EXPLICIT CHECK FOR DATASTORE PRIMARY KEY NOTE: DATASTORE SPECIFIC
              if( filter[ i ][ 0] === primaryKey ) {
                filter[ i ][ 0 ] = '__key__';
                filter[ i ][ 2 ] = getKey( filter[ i ][ 2 ] );
              }
              //WHERE ( KEY = VALUE ) ( AND ) ( KEY = VALUE )...
              query.filter(
                filter[ i ][ 0 ], // property
                filter[ i ][ 1 ], // operator
                filter[ i ][ 2 ] ); // value
              } else {
                //Filter is not having 3 values
                throw new Error( 'DbUtility: Filter not having 3 fields or not having correct type' );
              }
            }
          }  else {
            //Filter is not an array
            throw new Error( 'DbUtility: Wrong Type of filter' );
          }
        }

    } catch ( error ) {
      throw error;
    }
  }

  function offsetQuery( query, offset ) {
    try {

      //Fetch after skipping some entities
      if( offset != null ) {
        //Offset should be an Integer
        if( isNaN(offset) || typeof offset === 'object' ) {
          throw new Error( 'DbUtility: Wrong Type of offset' );
        } else {
          //Set Offset
          query.offset( Number(offset) );
        }

      }
    } catch ( error ) {
      throw error;
    }
  }

  function cursorQuery( query, cursor ) {
    try {

      //Fetch from some position
      if( cursor != null ) {
        //Cursor should be a string
        if( typeof cursor !== 'string' ) {
          //Cursor is not a string
          throw new Error( 'DbUtility: Wrong Type of cursor' );
        } else {
          //Point the cursor to the respective position
          query.start( cursor );
        }
      }

    } catch ( error ) {
      throw error;
    }
  }

  function limitQuery( query, limit ) {
    try {

      //Number of Entities in one query
      if( limit != null ) {
        //Limit should be an Integer
        if( isNaN( limit ) || typeof limit === 'object' ) {
          throw new Error( 'DbUtility: Wrong Type of limit' );
        } else {
          //Limit is set till 1000
          if( Number( limit )>1000 ) {
            //Limit can't be set greater than 1000
            throw new Error( 'DbUtility: Limit provided is greater than 1000' );
          }
          //Set limit
          query.limit( Number( limit ) );
        }
      } else {
        query.limit( 1000 );
      }

    } catch ( error ) {
      throw error;
    }
  }

  function orderByQuery( query, orderBy ) {
    try {

      //Sort by KEY
      //Orderby is provided
      if( orderBy != null ) {
        //Orderby should be an array
        if( Array.isArray( orderBy ) ) {
          //Sort in sequence of orders provided
          orderBy.forEach( ( order ) => {
            //Handling case where fieldnames are in lower case
            order = order.toUpperCase();
            //-KEY denotes descending order sort
            if( order.startsWith( '-' ) ) {
              //Explicit check for datastore primary key NOTE: Datastore specific
              if(order === ('-'+primaryKey)){
                order = '-__key__';
              }
              //Order by KEY
              query.order( order.substr( 1 ), { descending:true } );
            } else {
              //Explicit check for datastore primary key NOTE: Datastore specific
              if(order === primaryKey ){
                order = '__key__';
              }
              //Order by KEY
              query.order( order );
            }
          });
        } else {
          //Orderby is not an array
          throw new Error( 'DbUtility: Wrong Type of order' );
        }
      }

    } catch ( error ) {
      throw error;
    }
  }

  function selectQuery( query, select ) {
    try{
      //select is provided
      if(select != null) {
        if( Array.isArray( select ) ) {
          for( var q = 0; q < select.length; q++ ) {
            select[ q ] = select[ q ].toUpperCase();
            if( select[ q ] === primaryKey ) {
              select[ q ] = '__key__';
            }
          }
          query.select( select );
        } else {
          throw new Error( 'DbUtility: Select is not having correct type.' );
        }
      }
    } catch( error ) {
      throw error;
    }
  }

  function selectOnlyKeys( query, selectKeys ) {
    try{
      //selectOnlyKeys is provided
      if( selectKeys != null ) {
        if( typeof selectKeys === 'boolean' ) {
          if( selectKeys == true ) {
            query.select('__key__');
          }
        } else {
          throw new Error( 'DbUtility: Select is not having correct type.' );
        }
      }
    } catch( error ) {
      throw error;
    }
  }

  return {

    //PERFORMS QUERY ON TABLE WITH 'AND' OPERATION BETWEEN CONDITIONS WHERE CONDITIONS ARE EQUAL RELATIONS
    query: function( filter, offset, cursor, limit, orderBy, selectKeys/*,select*/ ) {
      try {
        //SELECT * FROM KIND
        var query = datastoreClient.createQuery( kind );

        //SELECT primaryKey FROM KIND NOTE: DATASTORE SPECIFIC
        selectOnlyKeys( query, selectKeys );
        //SELECT FIELDNAME FROM KIND
        // selectQuery( query, select );
        //WHERE FIELDNAME = VALUE AND ...
        filterQuery( query, filter );
        //SORT BY FIELDNAME AND ...
        orderByQuery( query, orderBy );
        //FROM CURSOR = VALUE
        cursorQuery( query, cursor );
        //WITH OFFSET = VALUE
        offsetQuery( query, offset );
        //LIMIT TO VALUE
        limitQuery( query, limit );

          //EXECUTE QUERY
          return datastoreClient.runQuery( query )
          .then( ( data ) => {
            var object = {};
            if ( data[ 0 ].length === 0 ) {
              //NO DATA FOUND
              object.data = [];
              //Cursor till which entities fetched
              object.endCursor = data[ 1 ].endCursor;
              //Any more entities remaining for a particular query
              object.moreResults = false;
            } else {
              //Cursor till which entities fetched
              object.endCursor = data[ 1 ].endCursor;
              //DATA FOUND AND BEING PROCESSED
              if( selectKeys != null && selectKeys == true ) {
                object.data = processOnlyPrimaryKeys( data[ 0 ] );
              } else {
                object.data = processEntities( data[ 0 ] );
              }
              //Any more entities remaining for a particular query
              if( data[ 1 ].moreResults !== datastoreModule.NO_MORE_RESULTS ) {
                object.moreResults = true;
              } else {
                object.moreResults = false;
              }
            }
            return object;
          } )
          .catch( ( error ) => {
            return new Promise( ( resolve, reject ) => {
              reject( error );
            } );
          } );
      } catch(error) {
        return new Promise( ( resolve, reject ) => {
          reject( error );
        } );
      }
    },

    //INSERT DATA IN TABLE, PRIMARY KEY IS USED IF PROVIDED ELSE GENERATED ON ITS OWN
    insert: function( data ) {
      try {
        //DATA SHOULD BE A MAP
        if( !(Array.isArray( data ) ) && typeof data === 'object' ) {
          //KEY NAMES OF MAP
          var keys = Object.keys( data );
          //IF NO KEY NAMES
          if( keys.length !== 0 ) {
            //HANDLING CASE WHERE FIELDNAMES ARE IN LOWER CASE
            var keysUpper = keys.map( toUpperCase );
            var newData = {};
            //CREATING NEW DATA WHERE KEYS ARE IN UPPERCASE
            for( var i = 0; i < keysUpper.length; i++  ) {
              newData[ keysUpper[ i ] ] = data[ keys[ i ] ];
            }
            //CHECK IF NEWDATA IS CONFORMING TO THE SPECIFIED SCHEMA
            var flag = checkSchema( newData );
            if( flag ) {

              newData = makeSchema( newData );
              //NOTE: DATASTORE SPECIFIC
              var key;
              //CREATE KEY IF PROVIDED EXPLICITLY
              if( newData[ primaryKey ] === structure[ primaryKey ].default && structure[ primaryKey ].type === 'STRING' ) {
                var value = new Date().getTime();
                value = value + "";
                key = getKey( value );
              } else if( newData[ primaryKey ] === structure[ primaryKey ].default ) {
                key = getNewKey();
              } else if( newData[ primaryKey ].value == structure[ primaryKey ].default ) {
                key = getNewKey();
              } else {
                var value = newData[ primaryKey ];
                key = getKey( value );
              }
              //NOTE: EXPLICIT DELETE OF KEY FROM DATA DUE TO DATASTORE SPECIFIC
              delete newData[ primaryKey ];
              dbFormatData = makeData( newData );
              var task = {
                key: key,
                excludeFromIndexes: excludeFromIndexes,
                data: dbFormatData
              };
              //INSERT DATA IF IT NOT EXISTS
              return datastoreClient.insert( task )
              .then( () => {
                //NOTE: DATASTORE SPECIFIC
                newData[ primaryKey ] = key.id ? parseInt( key.id ) : key.name;
                //MAKE DATA IN SPECIFIED SCHEMA
                newData = makeSchema( newData );
                return removeIntDoubleGeoObjects( newData );
              } )
              .catch( ( error ) => {
                return new Promise( ( resolve, reject ) => {
                  reject( error );
                } );
              } );
            } else {
              //WRONG FIELDS PROVIDED NOT CONFORMING TO SCHEMA
              throw new Error( 'DbUtility: Wrong fields provided. It is not according to SCHEMA structure provided.');
            }
          } else {
            //EMPTY MAP IS PROVIDED
            throw new Error( 'DbUtility: Empty Object' );
          }
        } else {
          //DATA IS NOT A MAP
          throw new Error( 'DbUtility: Wrong type of data' );
        }
      } catch( error ) {
        return new Promise( ( resolve, reject ) => {
          reject( error );
        } );
      }
    },

    //GET ENTITY FOR PRIMARY KEYS PROVIDED
    list: function( ids ) {
      try{
        //CHECK IF IDS IS ARRAY
        if( Array.isArray( ids ) ) {
          //IF ARRAY IS EMPTY
          if( ids.length !== 0 ) {
            //HANDLING CASE WHERE IDS HAVE NULL, UNDEFINED, 0, '', TRUE, FALSE BECAUSE KEY GENERATION WILL FAIL NOTE: DATASTORE SPECIFIC
            var newIds = _.without( ids, null, undefined, '', 0, true, false );

            //IF VALID NEWIDS
            if( newIds.length !== 0 ) {
              //GENERATE KEY FOR EACH ID NOTE: DATASTORE SPECIFIC
              var keys = newIds.map( getKey );

              //FETCH KEYS FROM DATASTORE
              return datastoreClient.get( keys ).then( ( dataArray ) => {
                var entityMap = {};

                //MAKE ENTITY IN DESIRED SCHEMA AND MAKE AN ENTITY MAP TO HAVE DUPLICATE ENTITY FOR DUPLICATE IDS
                processEntities( dataArray[ 0 ] ).forEach( ( entity ) => {
                  if( typeof entity[ primaryKey ] === 'string' ) {
                    entityMap[ 'NAME_' + entity[ primaryKey ] ] = entity;
                  } else {
                    entityMap[ 'ID_' + entity[ primaryKey ] ] = entity;
                  }
                } );

                //SORT THE IDS IN THE ORDER IDS ARE SENT AND ALSO APPEND NULL FOR IDS WHERE OBJECT IS NOT FOUND
                return sortEntities( ids, entityMap );
              } ).catch( ( error ) => {
                return new Promise( ( resolve, reject ) => {
                  reject( error );
                } );
              } );
            } else {
              //IDS CONTAIN ALL INVALID VALUES SO SENDING NULL FOR EACH ID
              var entityMap = {};
              return new Promise( ( resolve, reject ) => {
                resolve( sortEntities( ids, entityMap ) );
              } ) ;
            }
          } else {
            //NO ID IS PROVIDED
            throw new Error( 'DbUtility: Empty Object' );
          }
        } else {
          //WRONG TYPE OF IDS
          throw new Error( 'DbUtility: Not correct type of ids' );
        }
      } catch( error ) {
        return new Promise( ( resolve, reject ) => {
          reject( error );
        } );
      }
    },

    //DELETE KEYS FOR ONLY PRIMARY KEYS PROVIDED
    delete: function( id ) {
      try{
        if( !(Array.isArray( id ) ) && typeof id === 'object' ) {
          //KEY NAMES OF MAP
          var keys = Object.keys( id );
          //ONLY ONE KEY NAME NOTE: DATASTORE SPECIFIC
          if( keys.length === 1 ) {
            //HANDLING CASE WHERE FIELDNAMES ARE IN LOWER CASE
            var keysUpper = keys.map( toUpperCase );
            var idData = {};
            //CREATING NEW DATA WHERE KEYS ARE IN UPPERCASE
            for( var i = 0; i < keysUpper.length; i++  ) {
              idData[ keysUpper[ i ] ] = id[ keys[ i ] ];
            }
            //IF PRIMARY KEY IS NOT GIVEN THEN ERROR
            if( idData[ primaryKey ] != null ) {
              var flag = checkSchema( idData );
              if( flag ) {
                //DELETE ID IF IT EXISTS
                return datastoreClient.delete( getKey( idData[ primaryKey ] ) )
                .then( (data) => {
                  if( data[ 0 ].indexUpdates === 0 ){
                    throw new Error( 'DbUtility: Id doesn\'t exist' );
                  } else {
                    return 1;
                  }
                } )
                .catch( ( error ) => {
                  return new Promise( ( resolve, reject ) => {
                    reject( error );
                  } );
                } );
              }
            } else {
              //PRIMARY KEY IS NOT PROVIDED
              throw new Error( 'DbUtility: Primary key not provided.');
            }
          } else{
            //EXTRA FIELDS ARE PROVIDED
            throw new Error( 'DbUtility: Wrong number of arguments');
          }
        } else {
          //ID TYPE IS NOT CORRECT
          throw new Error( 'DbUtility: Not correct type of id' );
        }
      } catch( error ) {
        return new Promise( ( resolve, reject ) => {
          reject( error );
        } );
      }
    },

    //UPDATE ENTITY FOR PRIMARY KEY AND DATA PROVIDED
    update: function( id, data ) {
      try {
        //DATA SHOULD BE A MAP
        if( !( Array.isArray( id ) ) && !( Array.isArray( data ) ) && typeof id === 'object' && typeof data === 'object' ) {
          //KEY NAMES OF MAP
          var keys = Object.keys( data );
          var keysId = Object.keys( id );
          //IF NO KEY NAMES
          if( keys.length !== 0 && keysId.length === 1 ) {
            //HANDLING CASE WHERE FIELDNAMES ARE IN LOWER CASE
            var keysUpper = keys.map( toUpperCase );
            var keysIdUpper = keysId.map( toUpperCase );
            var newData = {};
            var newIdData = {};
            //CREATING NEW DATA WHERE KEYS ARE IN UPPERCASE
            for( var i = 0; i < keysUpper.length; i++  ) {
              newData[ keysUpper[ i ] ] = data[ keys[ i ] ];
            }
            for( i = 0; i < keysIdUpper.length; i++  ) {
              newIdData[ keysIdUpper[ i ] ] = id[ keysId[ i ] ];
            }
            if( newData[ primaryKey ] === undefined && newIdData[ primaryKey ] != null ) {
              //CHECK IF NEWDATA IS CONFORMING TO THE SPECIFIED SCHEMA
              var flag = checkSchema( newData );
              if( flag ) {
                newData = makeSchema( newData );
                //NOTE: EXPLICIT DELETE OF KEY FROM DATA DUE TO DATASTORE SPECIFIC
                delete newData[ primaryKey ];
                var key;
                //CREATE KEY NOTE: DATASTORE SPECIFIC
                var value = newIdData[ primaryKey ];
                key = getKey( value );
                dbFormatData = makeData( newData );
                var task = {
                  key: key,
                  excludeFromIndexes: excludeFromIndexes,
                  data: dbFormatData
                };
                //UPDATE DATA IF IT EXISTS
                return datastoreClient.update( task )
                .then( () => {
                  newData[ primaryKey ] = key.id ? parseInt( key.id ) : key.name;
                  //MAKE DATA IN SPECIFIED SCHEMA
                  newData =  makeSchema( newData );
                  return removeIntDoubleGeoObjects( newData );
                } )
                .catch( ( error ) => {
                  return new Promise( ( resolve, reject ) => {
                    reject( error );
                  } );
                } );

              } else {
                //WRONG FIELDS PROVIDED NOT CONFORMING TO SCHEMA
                throw new Error( 'DbUtility: Wrong fields provided. It is not according to SCHEMA structure provided.');
              }
            } else {
              throw new Error( 'DbUtility: Primary key provided in Data object or Primary key is not provided in ID object' );
            }
          } else {
            //EMPTY MAP IS PROVIDED
            throw new Error( 'DbUtility: Empty Objects or Wrong number of keys in ID object.' );
          }
        } else {
          //DATA IS NOT A MAP
          throw new Error( 'DbUtility: Wrong type of data' );
        }
      } catch( error ) {
        return new Promise( ( resolve, reject ) => {
          reject( error );
        } );
      }
    },

    //UPDATE ENTITY FOR PRIMARY KEY AND DATA PROVIDED
    patch: function( id, data ) {
      try {
        //DATA SHOULD BE A MAP
        if( !( Array.isArray( id ) ) && !( Array.isArray( data ) ) && typeof id === 'object' && typeof data === 'object' ) {
          //KEY NAMES OF MAP
          var keys = Object.keys( data );
          var keysId = Object.keys( id );
          //IF NO KEY NAMES
          if( keys.length !== 0 && keysId.length === 1 ) {
            //HANDLING CASE WHERE FIELDNAMES ARE IN LOWER CASE
            var keysUpper = keys.map( toUpperCase );
            var keysIdUpper = keysId.map( toUpperCase );
            var newData = {};
            var newIdData = {};
            //CREATING NEW DATA WHERE KEYS ARE IN UPPERCASE
            for( var i = 0; i < keysUpper.length; i++  ) {
              newData[ keysUpper[ i ] ] = data[ keys[ i ] ];
            }
            for( i = 0; i < keysIdUpper.length; i++  ) {
              newIdData[ keysIdUpper[ i ] ] = id[ keysId[ i ] ];
            }
            if( newData[ primaryKey ] === undefined && newIdData[ primaryKey ] != null ) {
              var key;
              //CREATE KEY
              var value = newIdData[ primaryKey ];
              key = getKey( value );
              return datastoreClient.get( key )
              .then( ( dataArray ) => {
                if( dataArray[ 0 ] === undefined ) {
                  throw new Error( 'DbUtility: Id doesn\'t exist' );
                } else {
                  var dataEntity = dataArray[ 0 ];
                  for( var i = 0; i < keysUpper.length; i++ ) {
                    dataEntity[ keysUpper[ i ] ] = newData[ keysUpper[ i ] ];
                  }
                  dataEntity = makeSchema( dataEntity );
                  //NOTE: EXPLICIT DELETE OF KEY FROM DATA DUE TO DATASTORE SPECIFIC
                  delete dataEntity[ primaryKey ];
                  //CHECK IF NEWDATA IS CONFORMING TO THE SPECIFIED SCHEMA
                  var flag = checkSchema( dataEntity );
                  if( flag ) {
                  dbFormatData = makeData( dataEntity );
                    var task = {
                      key: key,
                      excludeFromIndexes: excludeFromIndexes,
                      data: dbFormatData
                    };
                    //UPDATE DATA IF IT EXISTS
                    return datastoreClient.update( task )
                    .then( () => {
                      dataEntity[ primaryKey ] = key.id ? parseInt( key.id ) : key.name;
                      //MAKE DATA IN SPECIFIED SCHEMA
                      dataEntity =  makeSchema( dataEntity );
                      return removeIntDoubleGeoObjects( dataEntity );
                    } )
                    .catch( ( error ) => {
                      return new Promise( ( resolve, reject ) => {
                        reject( error );
                      } );
                    } );
                  } else {
                    //WRONG FIELDS PROVIDED NOT CONFORMING TO SCHEMA
                    throw new Error( 'DbUtility: Wrong fields provided. It is not according to SCHEMA structure provided.');
                  }
                }
              } )
              .catch( (error) => {
                return new Promise( ( resolve, reject ) => {
                  reject( error );
                } );
              } );
            } else {
              throw new Error( 'DbUtility: Primary key provided in Data object or Primary key is not provided in ID object' );
            }
          } else {
            //EMPTY MAP IS PROVIDED
            throw new Error( 'DbUtility: Empty Objects or Wrong number of keys in ID object.' );
          }
        } else {
          //DATA IS NOT A MAP
          throw new Error( 'DbUtility: Wrong type of data' );
        }
      } catch( error ) {
        return new Promise( ( resolve, reject ) => {
          reject( error );
        } );
      }
    },

    //GET SINGLE PRIMARY KEY
    get: function( id ) {
      try {
        if( id == null || id === '' || id === 0 || typeof id === 'boolean') {
          return new Promise( ( resolve, reject ) => {
            resolve( null );
          } ) ;
        } else if( typeof id === 'number' || typeof id === 'string' ) {
          return datastoreClient.get( getKey( id ) )
          .then( ( dataArray ) => {
            var data = dataArray[ 0 ];
            if( data === undefined ) {
              return null;
            } else {
              return processEntity( data );
            }
          } ).catch( ( error ) => {
            return new Promise( ( resolve, reject ) => {
              reject( error );
            } );
          } );
        } else {
          throw new Error( 'DbUtility: Wrong type of id' );
        }
      } catch(error) {
        return new Promise( ( resolve, reject ) => {
          reject( error );
        } );
      }
    }
  };
}
