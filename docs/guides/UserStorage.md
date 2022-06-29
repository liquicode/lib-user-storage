
# User Storage

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


Object Access and Permissions
---------------------------------------------------------------------

User storage supports three types of access to stored objects:
- System: Users having the role of `'admin'` or `'super'` can access the objects of any user.
- Object: Users having the role of `'user'` can access only those which they create or objects shared to them by other users.
- Public: Users having no role or only able to access objects marked as public.


UserStorage Functions
---------------------------------------------------------------------

- Discovery Functions
	- Count			( User, Criteria )
	- FindOne		( User, Criteria )
	- FindMany		( User, Criteria )

- Manipulation Functions
	- CreateOne		( User, Prototype )
	- WriteOne		( User, UserObject )
	- DeleteOne		( User, Criteria )
	- DeleteMany	( User, Criteria )

- Sharing Functions
	- Share			( User, Reader, Writer, Criteria )
	- Unshare		( User, Reader, Writer, Criteria )

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

