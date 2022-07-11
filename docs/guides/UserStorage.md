
# UserStorage

This library exposes functions for object creation, querying, and manipulation.
Each function, in turn, calls corresponding functions within the configured storage provider to complete its task.
What `UserStorage` does is the following:
- Provides an abstraction away from the ultimate details of object storage.
	These details are implemented in the configured `StorageProvider`.
- Provides user based access control to objects.
	Each function within `UserStorage` takes a user object as its first parameter
	which is used to add a layer of user identity to each query and operation.
	This means that each function runs in the context of the supplied user and is constrained
	to working with only those objects which they own or are shared to them.
- Provides a uniform object identity scheme.
	Each `StorageProvider` has its own identity mechanism (e.g. `{ _id: '8fbd40...' }`).
	`UserStorage` does not rely upon the `StorageProvider` defined identity, but instead,
	introduces its own identity mechanism which it (and the application) rely upon.


UserStorage Functions
---------------------------------------------------------------------

### UserStorage: Utility Functions

- `NewStorageObject ( Owner, Prototype )`
	: Returns a new `UserObject` containing the values found in `Prototype`.
	- The returned object will contain ownership and sharing information as specified by
		the `storage_info_member` configuration setting (defaults to `__`).
	- Despite its name, this new object exists in memory only and is not stored in any storage.

- `GetStorageInfo ( StorageObject )`
	: Returns the storage info portion of the object.
	- As specified by the `storage_info_member` configuration setting (defaults to `__`).

- `GetStorageData ( StorageObject )`
	: Returns the object data minus the storage info portion of the object.
	- As specified by the `storage_info_member` configuration setting (defaults to `__`).

- `UserCanShare ( User, StorageObject )`
	: Returns true if User can modify the sharing permission of this object.
	- Users who have a `user_role` of 'admin' or 'super' are able to share any object.
	- Users able to share any objects that they own.

- `UserCanWrite ( User, StorageObject )`
	: Returns true if User can modify the object itself.
	- Users who have a `user_role` of 'admin' or 'super' are able to write any object.
	- Users able to write any objects that they own.
	- Users able to write any objects that have them listed as writer.

- `UserCanRead ( User, StorageObject )`
	: Returns true if User can read the object.
	- Users who have a `user_role` of 'admin' or 'super' are able to read any object.
	- Users able to read any objects that they own.
	- Users able to read any objects that have them listed as reader or writer.
	- Users able to read any objects that have been marked as public.

### UserStorage: Discovery Functions

- `Count ( User, Criteria )`
	: Returns the number of objects available to `User` as specified by `Criteria`.

- `FindOne ( User, Criteria )`
	: Returns a single object as specified by `Criteria`.

- `FindMany ( User, Criteria )`
	: Returns an array of objects as specified by `Criteria`.

### UserStorage: Manipulation Functions

- `CreateOne ( User, Prototype )`
	: Creates a new object in the collection that is owned by `User`.

- `WriteOne ( User, Criteria, DataObject )`
	: Replaces a single object in the collection.

- `DeleteOne ( User, Criteria )`
	: Deletes a single object in the collection.

- `DeleteMany ( User, Criteria )`
	: Deletes multiple objects in the collection.

### UserStorage: Permissions Functions

- `SetOwner ( User, OwnerID, Criteria )`
	: Sets `OwnerID` as the owner of the objects specified by `Criteria`.
	- Users who have a `user_role` of 'admin' or 'super' are able to change ownership of any object.
	- Users are able to change ownership of any objects that they own.

- `SetSharing ( User, Criteria, Readers, Writers, MakePublic )`
	: Sets the sharing permissions of a number of objects.
	- `Readers` is a string or array of strings, containing the `user_id`s of the users that can read these objects.
		The readers list is overwritten.
	- `Writers` is a string or array of strings, containing the `user_id`s of the users that can write these objects.
		The writers list is overwritten.
	- `MakePublic` is an optional boolean value.
		If a boolean value is provided it will mark the matched objects as public or not public accordingly.

- `Share ( User, Criteria, Readers, Writers, MakePublic )`
	: Shares objects to other users.
	- `Readers` is a string or array of strings, containing the `user_id`s of the users that can read these objects.
		The readers list is modified and not overwritten.
		Every `user_id` provided will be added to the readers list.
	- `Writers` is a string or array of strings, containing the `user_id`s of the users that can write these objects.
		The writers list is modified and not overwritten.
		Every `user_id` provided will be added to the writers list.
	- `MakePublic` is an optional boolean value.
		If a boolean value is provided it will mark the matched objects as public or not public accordingly.

- `Unshare ( User, Criteria, NotReaders, NotWriters, MakeUnpublic )`
	: Unshares objects from other users.
	- `NotReaders` is a string or array of strings, containing the `user_id`s of the users that cannnot read these objects.
		The readers list is modified and not overwritten.
		Every `user_id` provided will be removed from the readers list.
	- `Writers` is a string or array of strings, containing the `user_id`s of the users that cannot write these objects.
		The writers list is modified and not overwritten.
		Every `user_id` provided will be removed from the writers list.
	- `MakeUnpublic` is an optional boolean value.
		If a boolean value is provided it will unmark the matched objects as public or not public accordingly.

### Common Function Parameters

- `User`
	: A json object containing values for the fields `user_id` and `user_role`.

- `Criteria` can be one of:
	- If missing/undefined, `null`, or empty `{}`, then all objects are matched.
	- A regular json object whose values are matched against the objects in storage.
		This is a MongoDB-like object query to specify one or more objects.
		See [Criteria](guides/Criteria.md) for more information.
	- A string representing the value of the storage info `id` field to match.
		This will result in matching a single object.
	- An storage object containing a storage info portion.
		The value of storage info `id` field will be matched.
		This will result in matching a single object.

- The `DataObject` parameter in the `WriteOne` function can be:
	- A user object with or without a storage info portion of the object.
		If storage info is present, it is ignored during any updates.
	- A json object that will be used to overwrite data fields of the matched stored object.

- When `StorageObject` is used for the `GetStorageData`, `GetStorageInfo`, `UserCanShare`, `UserCanWrite`, `UserCanRead`
functions, it must contain the storage info portion of the object.

### Function Return Values

- These functions return a single object: `CreateOne`, `ReadOne`, and `FindOne`.
- These functions return an array of objects: `ListAll`, `ListMine`, and `FindMany`.
- These functions return an integer value, indicating the number of objects that were found or affected:
	`CountAll`, `CountMine`,`WriteOne`, `DeleteOne`, `DeleteMine`, and `DeleteAll`.
- The storage provider implements the inner details of these functions.
- The `Criteria` parameter can be omitted, be `null`, or be an empty object `{}`.
	In such cases, these functions will exhibit special behavior:
	- `CountAll` will count all objects.
	- `CountMine` will count all objects belonging to the user.
	- `FindOne` will find the first (random) object belonging to the user.
	- `FindMany` will find all objects belonging to the user.

