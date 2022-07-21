# lib-user-storage
***(v0.2.1)***

A storage engine for user objects. Tracks object identity, ownership, and permissions.

```
                                                                                          +--------------------------+
                                                                                          |      MongoProvider       |
                                                                                      ==> +--------------------------+
                                                                                     /    | Reads and writes objects |
+-----------------+      +------------------------+      +--------------------+     /     | to a MongoDB instance.   |
|   Application   |      |     StorageObject      |      |    UserStorage     |    /      +--------------------------+
+-----------------+ <==> +------------------------+ <==> +--------------------+ <==      
| Works with user |      | Combines user identity |      | Controls access    |    \     
| owned objects.  |      | with object identity.  |      | by user identity.  |     \     +--------------------------+
+-----------------+      +------------------------+      +--------------------+      \    |      JsonProvider        |
                                                                                      ==> +--------------------------+
                                                                                          | Reads and writes objects |
                                                                                          | to an in-memory array.   |
                                                                                          +--------------------------+
```


**NOTE: This project supercedes the older project [lib-managed-storage](https://github.com/liquicode/lib-managed-storage).**


Overview
---------------------------------------------------------------------

One of the primary and initial challenges of developing a user-facing system is that of implementating a
storage mechanism which promotes the concept of user owned data.
This can be privata data such as documents and images.
This can also refer to data which is authored or attributed to the user such as a blog post or comment.

It is also a growing expectation among application users to be able to maintain private data (or data attributed to them),
in addition to being able to share that data with other users within the same application.

This library offers a way for NodeJS applications to implement storage strategies which promote user ownership
and the sharing of that data amongst other users of the same system.

This library does not provide any authentication mechanism.
It assumes that, by the time its functions are being called, the application has already confirmed the identity of the user.


Getting Started
---------------------------------------------------------------------

Install via NPM:
```bash
npm install @liquicode/lib-user-storage
```

Include the library in your source code:
```javascript
const LIB_USER_STORAGE = require( '@liquicode/lib-user-storage' );
```

Create a new storage service:
```javascript
let storage = LIB_USER_STORAGE.NewUserStorage(); // Defaults to an in-memory json array.
```

Store objects:
```javascript
let Bob = { user_id: 'bob@fake.com', user_role: 'user' };
new_doc = await storage.CreateOne( Bob, { name: 'About Me', text: 'I am a system user!' } );
```

Share objects:
```javascript
await storage.Share( Bob, new_doc, null, null, true ); // Make public, share with everyone.
```


Simple Usage
---------------------------------------------------------------------

```javascript
const LIB_USER_STORAGE = require( '@liquicode/lib-user-storage' );

// Make some fake users to work with.
let Alice = { user_id: 'alice@fake.com', user_role: 'admin' };
let Bob = { user_id: 'bob@fake.com', user_role: 'user' };
let Eve = { user_id: 'eve@fake.com', user_role: 'user' };

// Get the user storage.
let storage = LIB_USER_STORAGE.NewUserStorage(); // Defaults to an in-memory json array.

let doc = null;

// Alice creates a public document that anyone can read.
doc = await storage.CreateOne( Alice, { name: 'Public Document', text: 'This is a public document.' } );
await storage.Share( Alice, doc, null, null, true ); // Share this doc with everyone.

// Alice creates a restricted document that only specific users have read or write access to.
doc = await storage.CreateOne( Alice, { name: 'Internal Document', text: 'This is an internal document.' } );
await storage.Share( Alice, doc, null, Bob.user_id ); // Give read and write access to Bob.
await storage.Share( Alice, doc, Eve.user_id ); // Give read-only access to Eve.

// Alice creates a restricted document that only specific users have read or write access to.
doc = await storage.CreateOne( Alice, { name: 'Secret Document', text: 'This is a secret document.' } );
await storage.Share( Alice, doc, Bob.user_id ); // Give read-only access to Bob.

// Create some private documents for Bob.
doc = await storage.CreateOne( Bob, { name: 'My Document', text: 'This is my document.' } );
doc = await storage.CreateOne( Bob, { name: 'My Document 2', text: 'This is my other document.' } );

// Create a private document for Eve.
doc = await storage.CreateOne( Eve, { name: 'Evil Plans', text: 'Step 1: Take over the world.' } );

```


How It Works
---------------------------------------------------------------------

When storing user data to a backend storage device (e.g. MongoDB, JSON files) this library appends and maintains
a special "info" field to each stored object. The name of this "info" field is configurable and defaults to `__`.

For example, when you store a simple object such as:
```javascript
let thing = await storage.CreateOne( user, { foo: 'bar' } );
```
the stored representation (and the object returned to you) will look something like this:
```javascript
thing = {
	foo: 'bar',
	__: {	// Every stored object contains special info in its '__' field.
		id = 'cda0f50e-84b4-4a4e-91f5-29f73a00ffbb',	// unique id for this object.
		created_at: '2022-06-30T03:45:24.415Z',			// Timestamp of when this object was created.
		updated_at: '2022-06-30T03:45:24.415Z',			// Timestamp of when this object was last updated.
		owner_id = "alice@fake.com",					// User Identifier (anything unique to the user).
		readers = [],									// Array of user ids that have read access.
		writers = [],									// Array of user ids that have write access.
		public = false,									// Flag to give everyone read access to this object.
	}
}
```

The library tracks and manages object identity, ownership information, sharing permissions, and modification timestamps
for each object residing in storage.
This information allows the library to control, via library function calls, which objects are available to the users
calling the functions.

The library performs an authorization function allowing your application to easily allow users to have "ownership"
of their application data and to be able to share it to other users in the system.
Note that it is the responsibility of the larger application to ensure that the proper credentials are examined
and that a user is whom s/he claims to be.


API Summary
---------------------------------------------------------------------

To use this library, first install into your project with NPM:
```bash
npm install @liquicode/lib-user-storage
```

Then, include it into your application code like this:
```javascript
const LIB_USER_STORAGE = require( '@liquicode/lib-user-storage' );
```

### Library Functions
These function are available from the library itself (e.g. `LIB_USER_STORAGE`):

- `DefaultConfiguration ()`
	: Returns a default user storage configuration object.

- `NewUserStorage ( Configuration )`
	: Returns a `UserStorage` object that exports the rest of the functions below.
	-  See the [Configuration](guides/Configuration.md) topic for a more information
		on configuration and using storage providers.

- `StorageAdministrator ()`
	: Returns a user object having the 'admin' user role.
	(alias: `Administrator()`)

- `StorageSupervisor ()`
	: Returns a user object having the 'super' user role.
	(alias: `Supervisor()`)


### UserStorage Functions

See the [UserStorage](guides/UserStorage.md) topic for a more in-depth discussion of `UserStorage`
behaviors and functions.

- Utility Functions
	- NewStorageObject	( Owner, Prototype )
	- GetStorageInfo	( StorageObject )
	- GetStorageData	( StorageObject )
	- UserCanShare		( User, StorageObject )
	- UserCanWrite		( User, StorageObject )
	- UserCanRead		( User, StorageObject )

- Discovery Functions
	- Count				( User, Criteria )
	- FindOne			( User, Criteria )
	- FindMany			( User, Criteria )

- Manipulation Functions
	- CreateOne			( User, Prototype )
	- WriteOne			( User, UserObject )
	- DeleteOne			( User, Criteria )
	- DeleteMany		( User, Criteria )

- Sharing Functions
	- SetOwner			( User, OwnerID, Criteria )
	- SetSharing		( User, Criteria, Readers, Writers, MakePublic )
	- Share				( User, Reader, Writer, Criteria )
	- Unshare			( User, Reader, Writer, Criteria )


Notices
---------------------------------------------------------------------

- The `JsonProvider` implementation in this library was inspired in part by the project [jsondbfs](https://github.com/mcmartins/jsondbfs).
- The `JsonProvider` implementation in this library was inspired in part by the project [NeDB](https://github.com/louischatriot/nedb).
- Other projects similar to `JsonProvider`:
	- [lokijs](https://www.npmjs.com/package/lokijs)
	- [lowdb](https://github.com/typicode/lowdb)
	- [nedb](https://www.npmjs.com/package/nedb)
- In dedication to my family, without whom, this work would not be possible.


### Dependencies

- [uuid](https://www.npmjs.com/package/uuid)
	: Used by `UserStorage` and `JsonProvider` to generate unique identifiers.
- [mongodb](https://www.npmjs.com/package/mongodb)
	: Used by the `MongoProvider` implementation.
- [json-criteria](https://www.npmjs.com/package/json-criteria)
	: Used to provide MongoDB-like query functionality.
- [babel-polyfill](https://www.npmjs.com/package/@babel/polyfill)
	: A dependency of the `json-criteria` package.
- [lockfile](https://www.npmjs.com/package/lockfile)
	: Used by `JsonProvider` when flushing in-memory objects to disk.


### Project Links

- [Library Source Code](https://github.com/liquicode/lib-user-storage)
- [Library Docs Site](http://lib-user-storage.liquicode.com)
- [Library NPM Page](https://www.npmjs.com/package/@liquicode/lib-user-storage)

