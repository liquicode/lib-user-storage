
# Storage Object

Applications can call the `NewStorageObject( owner, object )` function to create a new storage object.


Object Lifecycle Management
---------------------------------------------------------------------

This library models an object and manages the following aspects of its lifecycle:
- Object Creation: Creation and modification timestamps are maintained for each object.
- Object Identity: Each object has a unique id.
- Object Ownership: Every object has a user as an owner.
- Object Serialization: Objects are saved to a structured storage using a MongoDB-like interface.
- Object Manipulation: Objects can be created, listed, searched, updated, and removed.


Storage Info Structure
---------------------------------------------------------------------

- A storage object will have a unique root member to store internal object metadata.
	This structure is static and is maintained by the library code.
	- `__`: The special field containing the storage info for this object.
		See `storage_info_member` in [Configuration](guides/Configuration.md).
		- `id`: The object's unique id, required by the interface functions.
		- `created_at`: The creation timestamp (zulu).
		- `updated_at`: The modification timestamp (zulu).
		- `owner_id`: The `User.user_id` of the object's owner.
		- `readers`: Array of `User.user_id`s that have read access to this object.
		- `writers`: Array of `User.user_id`s that have read/write access to this object.
		- `public`: Boolean flag marking this object as public.


Storage Access and Permissions
---------------------------------------------------------------------

User storage supports three types of access to stored objects:
- System: Users having the role of `'admin'` or `'super'` can access the objects of any user.
- Object: Users having the role of `'user'` can access only those objects which they create
or objects that are shared to them by another user.
- Public: Users having no role or only able to access objects marked as public.


User Objects
---------------------------------------------------------------------

A `User` object must have the `user_id` and `user_role` fields and is used as the first parameter to all of the storage interface functions.

Example user object:
```javascript
let Alice = {
	user_id: 'alice@fake.com',
	user_role: 'admin'
};
```

The `User.user_id` field must be a string value which uniquely identifies a user (e.g. an email address).

The `User.user_role` field can be one of the predefined roles `admin` or `super`,
which are roles that permit system-wide access to objects, regardless of ownership.
Applications can define their own roles apart from `admin` or `super` and implement further permission policies.
Such roles are referred to, collectively, as the `user` role throughout the rest of this documentation.


