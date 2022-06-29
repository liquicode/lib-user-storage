'use strict';


//---------------------------------------------------------------------
const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

//---------------------------------------------------------------------
require( 'babel-polyfill' );
const LIB_JSON_CRITERIA = require( 'json-criteria' );
const LIB_UUID = require( 'uuid' );
const LIB_LOCKFILE = require( 'lockfile' );

//---------------------------------------------------------------------
const LIB_UTILS = require( '../lib-utils.js' );
const { stringify } = require( 'querystring' );


//---------------------------------------------------------------------
exports.NewJsonProvider =
	function NewJsonProvider( Configuration = {} )
	{
		let Self = this;

		// Storage Provider State.
		let storage_provider = {};
		let storage_objects = [];
		let storage_filename = '';
		let storage_dirty = false;

		// Apply the configuration.
		if ( !LIB_UTILS.value_missing_null_empty( Configuration.database_name ) &&
			!LIB_UTILS.value_missing_null_empty( Configuration.collection_name ) )
		{

			// Load the collection.
			Configuration.database_name = LIB_PATH.resolve( Configuration.database_name );
			if ( !LIB_FS.existsSync( Configuration.database_name ) ) { LIB_FS.mkdirSync( Configuration.database_name, { recursive: true } ); }
			storage_filename = LIB_PATH.join( Configuration.database_name, Configuration.collection_name );
			if ( !storage_filename.toLowerCase().endsWith( '.json' ) ) { storage_filename += '.json'; }
			if ( Configuration.clear_collection_on_start )
			{
				if ( LIB_FS.existsSync( storage_filename ) ) { LIB_FS.unlinkSync( storage_filename ); }
			}
			if ( LIB_FS.existsSync( storage_filename ) )
			{
				storage_objects = JSON.parse( LIB_FS.readFileSync( storage_filename, 'utf8' ) );
				if ( !Array.isArray( storage_objects ) )
				{
					storage_objects = [ storage_objects ]; // Coerce single object to an array.
				}
			}

			// Setup the auto-flush.
			if ( Configuration.flush_every_ms && ( Configuration.flush_every_ms > 0 ) )
			{
				let timeout = setInterval( () => _Flush(), Configuration.flush_every_ms );
				timeout.unref(); // Prevent this interval from keeping the process running after the main loop ends.
			}

		}


		//=====================================================================
		// Flush
		//=====================================================================


		async function _Flush() 
		{
			return new Promise(
				async ( resolve, reject ) =>
				{
					try
					{
						if ( storage_dirty )
						{
							let lock_filename = storage_filename + '.lock';
							let lock_options = {
								// wait: 15000,
								// pollPeriod: 100,
								// retryWait: 100
								stale: 15000,
								retries: 1000,
							};
							try
							{
								LIB_LOCKFILE.lockSync( lock_filename, lock_options );
								LIB_FS.writeFileSync( storage_filename, JSON.stringify( storage_objects, null, '\t' ) );
							}
							catch ( error )
							{
								reject( error );
							}
							finally
							{
								LIB_LOCKFILE.unlockSync( lock_filename );
							}
						}
						storage_dirty = false;
						resolve();
					}
					catch ( error )
					{
						reject( error );
					}
					return;
				} );
		};
		storage_provider.Flush = _Flush;


		//=====================================================================
		// Count
		//=====================================================================


		storage_provider.Count =
			async function Count( Criteria ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							let object_count = 0;
							if ( LIB_UTILS.value_missing_null_empty( Criteria ) )
							{
								object_count = storage_objects.length;
							}
							else
							{
								for ( let object_index = 0; object_index < storage_objects.length; object_index++ )
								{
									let test_object = storage_objects[ object_index ];
									if ( LIB_JSON_CRITERIA.test( test_object, Criteria ) )
									{
										object_count++;
									}
								}
							}
							resolve( object_count );
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// FindOne
		//=====================================================================


		storage_provider.FindOne =
			async function FindOne( Criteria ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							let object = null;
							if ( LIB_UTILS.value_missing_null_empty( Criteria ) )
							{
								if ( storage_objects.length > 0 )
								{
									object = LIB_UTILS.clone( storage_objects[ 0 ] );
								}
							}
							else
							{
								for ( let object_index = 0; object_index < storage_objects.length; object_index++ )
								{
									let test_object = storage_objects[ object_index ];
									if ( LIB_JSON_CRITERIA.test( test_object, Criteria ) )
									{
										object = LIB_UTILS.clone( test_object );
										break;
									}
								}
							}
							resolve( object );
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// FindMany
		//=====================================================================


		storage_provider.FindMany =
			async function FindMany( Criteria ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							let found_objects = [];
							for ( let object_index = 0; object_index < storage_objects.length; object_index++ )
							{
								let test_object = storage_objects[ object_index ];
								if ( LIB_UTILS.value_missing_null_empty( Criteria ) )
								{
									found_objects.push( LIB_UTILS.clone( test_object ) );
								}
								else if ( LIB_JSON_CRITERIA.test( test_object, Criteria ) )
								{
									found_objects.push( LIB_UTILS.clone( test_object ) );
								}
							}
							resolve( found_objects );
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// CreateOne
		//=====================================================================


		storage_provider.CreateOne =
			async function CreateOne( DataObject ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							// insert will modify DataObject by setting the _id field.
							DataObject._id = LIB_UUID.v4();
							let new_data_object = LIB_UTILS.clone( DataObject );
							storage_objects.push( new_data_object );
							storage_dirty = true;
							if ( Configuration.flush_on_update ) { await _Flush(); }
							resolve( LIB_UTILS.clone( new_data_object ) );
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// WriteOne
		//=====================================================================


		storage_provider.WriteOne =
			async function WriteOne( DataObject, Criteria ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							if ( LIB_UTILS.value_missing_null_empty( Criteria ) )
							{
								if ( LIB_UTILS.value_missing_null_empty( DataObject._id ) )
								{
									throw new Error( `You must supply either [Criteria] or [DataObject._id] in the parameters.` );
								}
								Criteria = { _id: DataObject._id };
							}
							for ( let object_index = 0; object_index < storage_objects.length; object_index++ )
							{
								let test_object = storage_objects[ object_index ];
								if ( LIB_JSON_CRITERIA.test( test_object, Criteria ) )
								{
									storage_objects[ object_index ] = LIB_UTILS.merge_objects( test_object, DataObject );
									storage_dirty = true;
									if ( Configuration.flush_on_update ) { await _Flush(); }
									resolve( 1 );
									return;
								}
							}
							resolve( 0 );
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// DeleteOne
		//=====================================================================


		storage_provider.DeleteOne =
			async function DeleteOne( Criteria ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							let deleted_count = 0;
							if ( LIB_UTILS.value_missing_null_empty( Criteria ) )
							{
								if ( storage_objects.length > 0 )
								{
									storage_objects.splice( 0, 1 );
									deleted_count++;
								}
							}
							else
							{
								for ( let object_index = 0; object_index < storage_objects.length; object_index++ )
								{
									let test_object = storage_objects[ object_index ];
									if ( LIB_JSON_CRITERIA.test( test_object, Criteria ) )
									{
										storage_objects.splice( object_index, 1 );
										deleted_count++;
										break;
									}
								}
							}
							if ( deleted_count > 0 )
							{
								storage_dirty = true;
								if ( Configuration.flush_on_update ) { await _Flush(); }
							}
							resolve( deleted_count );
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// DeleteMany
		//=====================================================================


		storage_provider.DeleteMany =
			async function DeleteMany( Criteria ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							let deleted_count = 0;
							if ( LIB_UTILS.value_missing_null_empty( Criteria ) )
							{
								deleted_count = storage_objects.length;
								storage_objects = [];
							}
							else
							{
								for ( let object_index = storage_objects.length - 1; object_index >= 0; object_index-- )
								{
									let test_object = storage_objects[ object_index ];
									if ( LIB_JSON_CRITERIA.test( test_object, Criteria ) )
									{
										storage_objects.splice( object_index, 1 );
										deleted_count++;
									}
								}
							}
							if ( deleted_count > 0 )
							{
								storage_dirty = true;
								if ( Configuration.flush_on_update ) { await _Flush(); }
							}
							resolve( deleted_count );
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		return storage_provider;
	};

