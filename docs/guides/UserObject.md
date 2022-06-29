
# User Object

Applications can call the `NewUserObject( owner, object )` function to create a new user object.


Object Lifecycle Management
---------------------------------------------------------------------

This library models an object and manages the following aspects of its lifecycle:
- Object Creation: Creation and modification timestamps are maintained for each object.
- Object Identity: Each object has a unique id.
- Object Ownership: Every object has a user as an owner. There exists a built-in [System Administrator] user account.
- Object Serialization: Objects are saved to a structured storage using a MongoDB-like interface.
- Object Manipulation: Objects can be created, listed, searched, updated, and removed.


User Object Structure
---------------------------------------------------------------------

- A user object will have two root members:
	- `_m` to store internal object metadata. This structure is static and maintained by this code.
		- `_m.id`: The object's unique id, required by the interface functions.
		- `_m.created_at`: The creation timestamp (zulu).
		- `_m.updated_at`: The modification timestamp (zulu).
		- `_m.owner_id`: The `User.user_id` of the object's owner.
		- `_m.readers`: Array of `User.user_id`s that have read access to this object.
		- `_m.writers`: Array of `User.user_id`s that have read/write access to this object.
		- `_m.public`: Boolean flag marking this object as public.
	- `_o` to store application object data.
		This structure is defined by the application via the `ObjectDefinition` structure.


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

The `User.user_role` field can be one of:
- `'admin'`: A role that permits system-wide access to objects, regardless of ownership.
- `'super'`: A role that permits system-wide access to objects, regardless of ownership.
- `'user'`: A role that allows a user access to objects that they create, or are shared to by another user.
- `''` (empty): A role that allows a user access to only objects marked as public.


