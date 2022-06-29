"use strict";


const LIB_UUID = require( 'uuid' );

const LIB_UTILS = require( './lib-utils.js' );
const LIB_MONGO_PROVIDER = require( './StorageProviders/MongoProvider.js' );
const LIB_JSON_PROVIDER = require( './StorageProviders/JsonProvider.js' );


//=====================================================================
//=====================================================================
//
//		lib-user-storage
//
//=====================================================================
//=====================================================================


const LIB_USER_STORAGE = {};


//=====================================================================
// DefaultConfiguration
//=====================================================================


LIB_USER_STORAGE.DefaultConfiguration =
	function ()
	{
		return {
			// - User Storage Configuration -
			user_info_member: '__info',			// Name of the info field used in objects (e.g. thing.__info.id = '...').
			throw_permission_errors: false,		// Throw errors when user fails to have read or write access to an object.
			// - Json Provider Configuration -
			json_provider: {
				enabled: false,									// enable/disable this storage provider.
				collection_name: 'Collection-Name',				// Name of the collection. Also, name of the flush file.
				database_name: '/path/to/store/collections',	// Path of the flush file.
				clear_collection_on_start: false,				// Clear the flush file on startup.
				flush_on_update: false,							// Rewrite the flush file after each change (create, update, delete).
				flush_every_ms: 0,								// Continuously rewrite the flush file every 'X' milliseconds.
			},
			// - MongoDB Provider Configuration -
			mongo_provider: {
				enabled: false,							// enable/disable this storage provider.
				collection_name: 'Collection-Name',		// Name of the MongoDB collection.
				database_name: 'Database-Name',			// Name of the MongoDB database.
				connection_string: 'mongodb://<username>:<password>@<server-address',	// Connection string to the MongoDB server.
			},
		};
	};
exports.DefaultConfiguration = LIB_USER_STORAGE.DefaultConfiguration;


//=====================================================================
// Storage Administrator
//=====================================================================


LIB_USER_STORAGE.StorageAdministrator =
	function ()
	{
		return {
			name: 'Storage Administrator',
			user_id: 'admin@storage',
			user_role: 'admin',
		};
	};
exports.StorageAdministrator = LIB_USER_STORAGE.StorageAdministrator;


LIB_USER_STORAGE.StorageSupervisor =
	function ()
	{
		return {
			name: 'Storage Supervisor',
			user_id: 'super@storage',
			user_role: 'super',
		};
	};
exports.StorageSupervisor = LIB_USER_STORAGE.StorageSupervisor;


//=====================================================================
// NewUserStorage
//=====================================================================


LIB_USER_STORAGE.NewUserStorage =
	function NewUserStorage( StorageConfiguration = {} )
	{
		let user_storage = {};

		let _storage_configuration = LIB_USER_STORAGE.DefaultConfiguration();
		_storage_configuration = LIB_UTILS.merge_objects( _storage_configuration, StorageConfiguration );


		//=====================================================================
		// Storage Provider
		//=====================================================================


		// Get the storage provider.
		let storage_provider = null;
		if ( _storage_configuration.mongo_provider && _storage_configuration.mongo_provider.enabled )
		{
			storage_provider = LIB_MONGO_PROVIDER.NewMongoProvider( _storage_configuration.mongo_provider );
		}
		else if ( _storage_configuration.json_provider && _storage_configuration.json_provider.enabled )
		{
			storage_provider = LIB_JSON_PROVIDER.NewJsonProvider( _storage_configuration.json_provider );
		}
		else
		{
			storage_provider = LIB_JSON_PROVIDER.NewJsonProvider();
		}


		// Configuration shortcuts.
		let _info_member = _storage_configuration.user_info_member;


		//=====================================================================
		// Storage Interface
		//=====================================================================


		//---------------------------------------------------------------------
		function _ValidateUser( User )
		{
			if ( LIB_UTILS.value_missing_null_empty( User ) ) { throw LIB_UTILS.MISSING_PARAMETER_ERROR( 'User' ); }
			if ( LIB_UTILS.value_missing_null_empty( User.user_id ) ) { throw LIB_UTILS.MISSING_PARAMETER_ERROR( 'User.user_id' ); }
			if ( LIB_UTILS.value_missing_null_empty( User.user_role ) ) { throw LIB_UTILS.MISSING_PARAMETER_ERROR( 'User.user_role' ); }
			// if ( ![ 'admin', 'super', 'user' ].includes( User.user_role ) ) { throw new Error( `Unknown value for User.user_role: [${User.user_role}]` ); }
			return;
		}


		//---------------------------------------------------------------------
		function _ValidateUserObject( UserObject )
		{
			if ( LIB_UTILS.value_missing_null_empty( UserObject ) ) { throw LIB_UTILS.MISSING_PARAMETER_ERROR( 'UserObject' ); }
			if ( LIB_UTILS.value_missing_null_empty( UserObject[ _info_member ] ) ) { throw LIB_UTILS.MISSING_PARAMETER_ERROR( 'UserObject[ info_member ]' ); }
			if ( LIB_UTILS.value_missing_null_empty( UserObject[ _info_member ].id ) ) { throw LIB_UTILS.MISSING_PARAMETER_ERROR( 'UserObject[ info_member ].id' ); }
			if ( LIB_UTILS.value_missing_null_empty( UserObject[ _info_member ].owner_id ) ) { throw LIB_UTILS.MISSING_PARAMETER_ERROR( 'UserObject[ info_member ].owner_id' ); }
			if ( LIB_UTILS.value_missing( UserObject[ _info_member ].readers ) ) { throw LIB_UTILS.MISSING_PARAMETER_ERROR( 'UserObject[ info_member ].readers' ); }
			if ( LIB_UTILS.value_missing( UserObject[ _info_member ].writers ) ) { throw LIB_UTILS.MISSING_PARAMETER_ERROR( 'UserObject[ info_member ].writers' ); }
			if ( LIB_UTILS.value_missing( UserObject[ _info_member ].public ) ) { throw LIB_UTILS.MISSING_PARAMETER_ERROR( 'UserObject[ info_member ].public' ); }
			return;
		}


		//---------------------------------------------------------------------
		user_storage.NewUserObject =
			function NewUserObject( Owner, Prototype ) 
			{
				if ( !LIB_UTILS.value_exists( Owner ) ) { throw LIB_UTILS.MISSING_PARAMETER_ERROR( 'Owner' ); }
				if ( !LIB_UTILS.value_exists( Owner.user_id ) ) { throw LIB_UTILS.MISSING_PARAMETER_ERROR( 'Owner.user_id' ); }

				// Create a new user object.
				let user_object = LIB_UTILS.clone( Prototype );
				delete user_object[ _info_member ];
				user_object[ _info_member ] = {
					id: LIB_UUID.v4(),
					created_at: LIB_UTILS.zulu_timestamp(),
					updated_at: LIB_UTILS.zulu_timestamp(),
					owner_id: Owner.user_id,
					readers: [],
					writers: [],
					public: false,
				};

				// Return the user object.
				return user_object;
			};


		//---------------------------------------------------------------------
		user_storage.GetUserData =
			function GetUserData( DataObject ) 
			{
				let user_data = LIB_UTILS.clone( DataObject );
				delete user_data[ _info_member ];
				return user_data;
			};


		//---------------------------------------------------------------------
		user_storage.GetUserInfo =
			function GetUserData( DataObject ) 
			{
				let user_info = {};
				if ( typeof DataObject[ _info_member ] === 'object' ) 
				{
					user_info = LIB_UTILS.clone( DataObject[ _info_member ] );
				}
				return user_info;
			};


		//---------------------------------------------------------------------
		function _UserCanWrite( User, UserObject )
		{
			_ValidateUser( User );
			_ValidateUserObject( UserObject );
			if ( User.user_role === 'admin' ) { return true; }
			if ( User.user_role === 'super' ) { return true; }
			// if ( User.user_role === 'user' ) 
			// {
			// 	if ( User.user_id === UserObject[ info_member ].owner_id ) { return true; }
			// 	if ( UserObject[ info_member ].writers.includes( User.user_id ) ) { return true; }
			// }
			if ( User.user_id === UserObject[ _info_member ].owner_id ) { return true; }
			if ( UserObject[ _info_member ].writers.includes( User.user_id ) ) { return true; }
			return false;
		}


		//---------------------------------------------------------------------
		function _UserCriteria( User, ObjectOrID )
		{
			_ValidateUser( User );

			// Construct the query criteria.
			let criteria = {};

			let object_type = ( typeof ObjectOrID );
			if ( object_type === 'undefined' ) 
			{
				// Do nothing. Find all objects.
			}
			else if ( object_type === 'string' )
			{
				criteria[ _info_member ] = { id: ObjectOrID }; // Match a single, specific object.
			}
			else if ( object_type === 'object' )
			{
				if ( ObjectOrID === null )
				{
					// Do nothing. Find all objects.
				}
				else
				{
					let user_info = user_storage.GetUserInfo( ObjectOrID );
					if ( !LIB_UTILS.value_missing_null_empty( user_info.id ) )
					{
						criteria[ _info_member ] = { id: user_info.id }; // Match a single, specific object.
					}
					else
					{
						criteria = user_storage.GetUserData( ObjectOrID ); // match the provided object.
						// if ( !LIB_UTILS.value_missing_null_empty( ObjectOrID._o ) )
						// {
						// 	criteria._o = LIB_UTILS.clone( ObjectOrID._o ); // match _o with the proviuded values.
						// }
						// else
						// {
						// 	criteria._o = LIB_UTILS.clone( ObjectOrID ); // match _o with the proviuded values.
						// 	delete criteria._o[ info_member ];
						// }
					}
				}
			}
			else
			{
				throw new Error( `Unknown parameter type [${object_type}] for [ObjectOrID]. Must be a string, object, null, or undefined.` );
			}

			// Apply role based restrictions on object reading.
			if ( User.user_role === 'admin' ) 
			{
				// Do nothing. Allow reading of all objects.
			}
			else if ( User.user_role === 'super' ) 
			{
				// Do nothing. Allow reading of all objects.
			}
			else
			{
				criteria.$or = []; // Use a set of optional conditions.
				{
					// Return objects owned by this user.
					let info_test = {};
					info_test[ _info_member + '.owner_id' ] = User.user_id;
					criteria.$or.push( info_test );
				}
				{
					// Return objects shared to this user.
					let info_test = {};
					info_test[ _info_member + '.readers' ] = { $in: User.user_id };
					criteria.$or.push( info_test );
				}
				{
					// Return objects shared to this user.
					let info_test = {};
					info_test[ _info_member + '.writers' ] = { $in: User.user_id };
					criteria.$or.push( info_test );
				}
				{
					// Return public objects.
					let info_test = {};
					info_test[ _info_member + '.public' ] = true;
					criteria.$or.push( info_test );
				}
				// let owner_id_member = _info_member + '.owner_id';
				// let readers_member = _info_member + '.readers';
				// let writers_member = _info_member + '.writers';
				// let public_member = _info_member + '.public';
				// criteria.$or.push( { owner_id_member: User.user_id } ); // Return objects owned by this user.
				// criteria.$or.push( { readers_member: { $in: User.user_id } } ); // Return objects shared to this user.
				// criteria.$or.push( { writers_member: { $in: User.user_id } } ); // Return objects shared to this user.
				// criteria.$or.push( { public_member: true } ); // Return public objects.
			}

			return criteria;
		}


		//=====================================================================
		// Count
		//=====================================================================


		user_storage.Count =
			async function Count( User, Criteria )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					return await storage_provider.Count( criteria );
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// FindOne
		//=====================================================================


		user_storage.FindOne =
			async function FindOne( User, Criteria )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let object = await storage_provider.FindOne( criteria );
					if ( object ) { delete object._id; }
					return object;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// FindMany
		//=====================================================================


		user_storage.FindMany =
			async function FindMany( User, Criteria )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let objects = await storage_provider.FindMany( criteria );
					objects.forEach( object => { delete object._id; } );
					return objects;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// CreateOne
		//=====================================================================


		user_storage.CreateOne =
			async function CreateOne( User, Prototype )
			{
				try
				{
					let user_object = user_storage.NewUserObject( User, Prototype );
					let object = await storage_provider.CreateOne( user_object );
					if ( object ) { delete object._id; }
					return object;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// WriteOne
		//=====================================================================


		user_storage.WriteOne =
			async function WriteOne( User, Criteria, DataObject )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let found_object = await storage_provider.FindOne( criteria );
					if ( !found_object ) 
					{
						if ( _storage_configuration.throw_permission_errors ) { throw LIB_UTILS.READ_ACCESS_ERROR(); }
						else { return 0; }
					}
					if ( !_UserCanWrite( User, found_object ) ) 
					{
						if ( _storage_configuration.throw_permission_errors ) { throw LIB_UTILS.WRITE_ACCESS_ERROR(); }
						else { return 0; }
					}
					// if ( !LIB_UTILS.value_missing_null_empty( DataObject._o ) )
					// {
					// 	DataObject = DataObject._o;
					// }
					found_object[ _info_member ].updated_at = LIB_UTILS.zulu_timestamp();
					// found_object._o = LIB_UTILS.merge_objects( found_object._o, DataObject );
					found_object = LIB_UTILS.merge_objects( found_object, DataObject );
					return await storage_provider.WriteOne( found_object );
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// DeleteOne
		//=====================================================================


		user_storage.DeleteOne =
			async function DeleteOne( User, Criteria )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let found_object = await storage_provider.FindOne( criteria );
					if ( !found_object ) 
					{
						if ( _storage_configuration.throw_permission_errors ) { throw LIB_UTILS.READ_ACCESS_ERROR(); }
						else { return 0; }
					}
					if ( !_UserCanWrite( User, found_object ) ) 
					{
						if ( _storage_configuration.throw_permission_errors ) { throw LIB_UTILS.WRITE_ACCESS_ERROR(); }
						else { return 0; }
					}
					return await storage_provider.DeleteOne( _UserCriteria( User, found_object ) );
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// DeleteMany
		//=====================================================================


		user_storage.DeleteMany =
			async function DeleteMany( User, Criteria )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let operation_count = 0;
					let found_objects = await storage_provider.FindMany( criteria );
					for ( let found_object_index = 0; found_object_index < found_objects.length; found_object_index++ )
					{
						let found_object = found_objects[ found_object_index ];
						if ( _UserCanWrite( User, found_object ) )
						{
							let count = await storage_provider.DeleteOne( _UserCriteria( User, found_object ) );
							if ( !count ) { throw new Error( `There was an unexpected problem deleting the object.` ); }
							operation_count++;
						}
					}
					return operation_count;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// SetOwner
		//=====================================================================


		user_storage.SetOwner =
			async function SetOwner( User, Criteria )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let operation_count = 0;
					let found_objects = await storage_provider.FindMany( criteria );
					for ( let found_object_index = 0; found_object_index < found_objects.length; found_object_index++ )
					{
						let found_object = found_objects[ found_object_index ];
						if ( _UserCanWrite( User, found_object ) )
						{
							found_object[ _info_member ].owner_id = User.user_id;
							found_object[ _info_member ].updated_at = LIB_UTILS.zulu_timestamp();
							operation_count += await storage_provider.WriteOne( found_object );
						}
					}
					return operation_count;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// Share
		//=====================================================================


		user_storage.Share =
			async function Share( User, Criteria, Readers, Writers, MakePublic )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let operation_count = 0;
					let found_objects = await storage_provider.FindMany( criteria );
					for ( let found_object_index = 0; found_object_index < found_objects.length; found_object_index++ )
					{
						let found_object = found_objects[ found_object_index ];
						if ( _UserCanWrite( User, found_object ) )
						{
							// Update the object.
							let modified = false;
							if ( !LIB_UTILS.value_missing_null_empty( Readers ) )
							{
								let readers = [];
								if ( typeof Readers === 'string' ) { readers.push( Readers ); }
								else if ( Array.isArray( Readers ) ) { readers = Readers; }
								else { throw new Error( `Invalid value for parameter [Readers], must be a string or array of strings.` ); }
								readers.forEach(
									element =>
									{
										if ( !found_object[ _info_member ].readers.includes( element ) )
										{
											found_object[ _info_member ].readers.push( element );
											modified = true;
										}
									} );
							}
							if ( !LIB_UTILS.value_missing_null_empty( Writers ) )
							{
								let writers = [];
								if ( typeof Writers === 'string' ) { writers.push( Writers ); }
								else if ( Array.isArray( Writers ) ) { writers = Writers; }
								else { throw new Error( `Invalid value for parameter [Readers], must be a string or array of strings.` ); }
								writers.forEach(
									element =>
									{
										if ( !found_object[ _info_member ].writers.includes( element ) )
										{
											found_object[ _info_member ].writers.push( element );
											modified = true;
										}
									} );
							}
							if ( !LIB_UTILS.value_missing_null_empty( MakePublic ) && MakePublic )
							{
								if ( !found_object[ _info_member ].public )
								{
									found_object[ _info_member ].public = true;
									modified = true;
								}
							}

							// Write the object.
							if ( modified )
							{
								found_object[ _info_member ].updated_at = LIB_UTILS.zulu_timestamp();
								operation_count += await storage_provider.WriteOne( found_object );
							}
						}
					}
					return operation_count;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// Unshare
		//=====================================================================


		user_storage.Unshare =
			async function Unshare( User, Criteria, NotReaders, NotWriters, MakeNotPublic )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let operation_count = 0;
					let found_objects = await storage_provider.FindMany( criteria );
					for ( let found_object_index = 0; found_object_index < found_objects.length; found_object_index++ )
					{
						let found_object = found_objects[ found_object_index ];
						if ( _UserCanWrite( User, found_object ) )
						{
							// Update the object.
							let modified = false;
							if ( !LIB_UTILS.value_missing_null_empty( NotReaders ) )
							{
								let not_readers = [];
								if ( typeof NotReaders === 'string' ) { not_readers.push( NotReaders ); }
								else if ( Array.isArray( Readers ) ) { not_readers = NotReaders; }
								else { throw new Error( `Invalid value for parameter [Readers], must be a string or array of strings.` ); }
								not_readers.forEach(
									element =>
									{
										let index = found_object[ _info_member ].readers.indexOf( element );
										if ( index >= 0 )
										{
											found_object[ _info_member ].readers.slice( index, 1 );
											modified = true;
										}
									} );
							}
							if ( !LIB_UTILS.value_missing_null_empty( NotWriters ) )
							{
								let not_writers = [];
								if ( typeof NotWriters === 'string' ) { not_writers.push( NotWriters ); }
								else if ( Array.isArray( NotWriters ) ) { not_writers = NotWriters; }
								else { throw new Error( `Invalid value for parameter [Readers], must be a string or array of strings.` ); }
								not_writers.forEach(
									element =>
									{
										let index = found_object[ _info_member ].writers.indexOf( element );
										if ( index >= 0 )
										{
											found_object[ _info_member ].writers.slice( index, 1 );
											modified = true;
										}
									} );
							}
							if ( !LIB_UTILS.value_missing_null_empty( MakeNotPublic ) && MakeNotPublic )
							{
								if ( found_object[ _info_member ].public )
								{
									found_object[ _info_member ].public = false;
									modified = true;
								}
							}

							// Write the object.
							if ( modified )
							{
								found_object[ _info_member ].updated_at = LIB_UTILS.zulu_timestamp();
								operation_count += await storage_provider.WriteOne( found_object );
							}
						}
					}
					return operation_count;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// Return Storage
		//=====================================================================


		return user_storage;


	};
exports.NewUserStorage = LIB_USER_STORAGE.NewUserStorage;

