# lib-user-storage
***(v0.1.0)***

A storage engine for user objects. Tracks object identity, ownership, and permissions.

```
                                                                                          +--------------------------+
                                                                                          |      MongoProvider       |
                                                                                      ==> +--------------------------+
                                                                                     /    | Reads and writes objects |
+-----------------+      +------------------------+      +--------------------+     /     | to a MongoDB instance.   |
|   Application   |      |      UserObject        |      |    UserStorage     |    /      +--------------------------+
+-----------------+ <==> +------------------------+ <==> +--------------------+ <==      
| Works with user |      | Combines user identity |      | Controls access    |    \     
| owned objects.  |      | with object identity.  |      | by user identity.  |     \     +--------------------------+
+-----------------+      +------------------------+      +--------------------+      \    |      JsonProvider        |
                                                                                      ==> +--------------------------+
                                                                                          | Reads and writes objects |
                                                                                          | to an in-memory array.   |
                                                                                          +--------------------------+
```


Getting Started
---------------------------------------------------------------------

Install via NPM:
```bash
npm install @liquicode/lib-user-storage
```

Include the library in your source code:
```javascript
const Lib = require( '@liquicode/lib-user-storage' );
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
These function are available from the library root (e.g. `LIB_USER_STORAGE`):

- `DefaultConfiguration ( )`
	: Returns a default storage configuration object.

- `NewUserStorage ( Configuration )`
	: Returns a `UserStorage` object that exports the rest of the functions below.

### Utility Functions

- `NewUserObject ( Owner, Prototype )`
	: Returns a new `UserObject` containing the values of `Prototype` and a complete user info portion.
	As specified by the `user_info_member` configuration setting (defaults to `__info`).

- `GetUserInfo ( DataObject )`
	: Returns the user info portion of the object.
	As specified by the `user_info_member` configuration setting (defaults to `__info`).

- `GetUserData ( DataObject )`
	: Returns the object data minus the user info portion of the object.
	As specified by the `user_info_member` configuration setting (defaults to `__info`).

### Discovery Functions

- `Count ( User, Criteria )`
	: Returns the number of objects available to `User` as specified by `Criteria`.

- `FindOne ( User, Criteria )`
	: Returns a single object as specified by `Criteria`.

- `FindMany ( User, Criteria )`
	: Returns an array of objects as specified by `Criteria`.

### Manipulation Functions

- `CreateOne ( User, Prototype )`
	: Creates a new object in the collection that is owned by `User`.

- `WriteOne ( User, Criteria, DataObject )`
	: Replaces a single object in the collection.

- `DeleteOne ( User, Criteria )`
	: Deletes a single object in the collection.

- `DeleteMany ( User, Criteria )`
	: Deletes multiple objects in the collection.

### Permissions Functions

- `SetOwner ( User, OwnerID, Criteria )`
	: Sets `OwnerID` as the owner of the objects specified by `Criteria`.
	Only users with a `user_role` of `'admin'` or `'super'` can call this function.

- `Share ( User, Criteria, Readers, Writers, MakePublic )`
	: Shares objects to other users.
	`Readers` is a string or array of strings, containing the `user_id`s of the users that can read these objects.
	The readers list is updated and not overwritten.
	Every `user_id` provided will be added to from the readers list.
	`Writers` is a string or array of strings, containing the `user_id`s of the users that can write these objects.
	The writers list is updated and not overwritten.
	Every `user_id` provided will be added to from the writers list.
	`MakePublic` is an optional boolean value.
	If a boolean value is provided it will mark the matched objects as public or not public accordingly.

- `Unshare ( User, Criteria, NotReaders, NotWriters, MakeUnpublic )`
	: Unshares objects from other users.
	`NotReaders` is a string or array of strings, containing the `user_id`s of the users that cannnot read these objects.
	The readers list is updated and not overwritten.
	Every `user_id` provided will be removed from the readers list.
	`Writers` is a string or array of strings, containing the `user_id`s of the users that cannot write these objects.
	The writers list is updated and not overwritten.
	Every `user_id` provided will be removed from the writers list.
	`MakeUnpublic` is an optional boolean value.
	If a boolean value is provided it will unmark the matched objects as public or not public accordingly.

### Common Function Parameters

- `User`
	: A json object containing values for the fields `user_id` and `user_role`.

- `Criteria` can be one of:
	- If missing/undefined, `null`, or empty `{}`, then all objects are matched.
	- A regular json object whose values are matched against the objects in storage.
		This is a MongoDB-like object query to specify one or more objects.
		See [json-criteria](guides/json-criteria.md) for more information.
	- A string representing the value of the user info `id` field to match in storage.
	- A user object with or without a user info portion of the object.
		If user info is present, then the value of user info `id` field will be matched.
		If user info is missing, then the object will be matched as a regular json object.

- The `DataObject` parameter in the `WriteOne` function can be:
	- A user object with or without a user info portion of the object.
		If user info is present, it is ignored during any updates.
	- A json object that will be used to overwrite data fields of the matched stored object.


Notices
---------------------------------------------------------------------

- Dedicated to my family, without whom, this work would not be possible.
- Source code ASCII art banners generated using [https://patorjk.com/software/taag](https://patorjk.com/software/taag/#p=display&f=Univers) with the "Univers" font.
- The `JsonProvider` implementation in this library was inspired in part by the project [jsondbfs](https://github.com/mcmartins/jsondbfs).
- The `JsonProvider` implementation in this library was inspired in part by the project [NeDB](https://github.com/louischatriot/nedb).


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

