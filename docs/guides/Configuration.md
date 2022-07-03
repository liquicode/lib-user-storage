
# Configuration

Setup of the underlying storage and related behaviors are controlled through configuration.

The function `LIB_USER_STORAGE.NewUserStorage( Configuration )` takes a single optional configuration parameter:
```javascript
let Configuration = {
	// - User Storage Configuration -
	user_info_member: '__info',			// Name of the info field used in objects (e.g. thing.__info.id = '...').
	throw_permission_errors: false,		// Throw errors when user fails to have read or write access to an object.
	// - MongoDB Provider Configuration -
	// - Json Provider Configuration -
	JsonProvider: {
		enabled: false,									// enable/disable this storage provider.
		collection_name: 'Collection-Name',				// Name of the collection. Also, name of the flush file.
		database_name: '/path/to/store/collections',	// Path of the flush file.
		clear_collection_on_start: false,				// Clear the flush file on startup.
		flush_on_update: false,							// Rewrite the flush file after each change (create, update, delete).
		flush_every_ms: 0,								// Continuously rewrite the flush file every 'X' milliseconds.
	},
	MongoProvider: {
		enabled: false,							// enable/disable this storage provider.
		collection_name: 'Collection-Name',		// Name of the MongoDB collection.
		database_name: 'Database-Name',			// Name of the MongoDB database.
		connection_string: 'mongodb://<username>:<password>@<server-address',	// Connection string to the MongoDB server.
	},
};
```


## Notes

- The `throw_permission_errors` configuration value determines if a storage function will throw an error
when a user tries to read or write a specific object and does not have permission to do so.
Permission errors are only thrown by the `WriteOne` and `DeleteOne` functions.
In either case, `WriteOne` and `DeleteOne` will return a `0`, indicating that no objects were written or deleted.

- The text for a thrown read permission error is: `User does not have read access to this object or the object does not exist.`

- The text for a thrown write permission error is: `User does not have write access to this object.`

- The fields `database_name` and `collection_name` within the `JsonProvider` configuration block are combined
to form the filename and path of the collection's flush file.
(e.g. `/path/to/store/collections/Collection-Name.json`)
Take care that these fields represent a valid file system name for your operating system.
If this file exists when the storage is created, then the contents of this file will be loaded and
used to populate the in-memory representation of the collection.
Use `clear_collection_on_start` to ignore this file if it already exists, always starting with an empty collection.
Use either `flush_on_update` or `flush_every_ms` to overwrite the contents of this file when the collection changes.

- If both the `JsonProvider` and `MongoProvider` have `enabled` fields set to `true`, then the storage will use
the `MongoProvider` and not the `JsonProvider`.


## Default Configuration

If a configuration object is not provided, or is partially provided, then default configuration values will bw used.
You can call `LIB_USER_STORAGE.DefaultConfiguration()` to obtain the default configuration values.
These values can be modified and then passed on to the `NewUserStorage` function.
If a partial configuration object is passed, then missing values will be taken from the defaults.


## Examples

**Create a User Storage backed by an in-memory array of objects**
This will create an in-memory storage that supports all of the storgae methods.
```javascript
let storage = LIB_USER_STORAGE.NewUserStorage();
let thing = storage.CreateOne( /* parameters here */ );
```

**Create a User Storage also backed by an in-memory array of objects periodically flushed to a file**
This will create an in-memory storage that will be saved to the file `./things/Collection-Of-Things.json` every 50 milliseconds.
Keep in mind that the selection of `collection_name` and `database_name` must result in valid file system names for your operating system.
```javascript
let storage = LIB_USER_STORAGE.NewUserStorage( {
	JsonProvider: {
		enabled: true,
		collection_name: 'Collection-Of-Things',
		database_name: './things',
		flush_every_ms: 50,
	} } );
let thing = storage.CreateOne( /* parameters here */ );
```

**Create a User Storage backed by a MongoDB server**
This will create a storage connected to a collection managed by a remote MongoDB server.
```javascript
let storage = LIB_USER_STORAGE.NewUserStorage( {
	mongodb_provider: {
		enabled: true,
		collection_name: 'Collection-Of-Things',
		database_name: 'things',
		connection_string: 'mongodb://username:password@server-address',
	} } );
let thing = storage.CreateOne( /* parameters here */ );
```

