
# User Object

Applications can call the `NewUserObject( owner, object )` function to create a new user object.


Object Lifecycle Management
---------------------------------------------------------------------

This library models an object and manages the following aspects of its lifecycle:
- Object Creation: Creation and modification timestamps are maintained for each object.
- Object Identity: Each object has a unique id.
- Object Ownership: Every object has a user as an owner. There exists built-in [System Administrator] user account.
- Object Serialization: Objects are saved to a structured storage using a MongoDB-like interface.
- Object Manipulation: Objects can be created, listed, searched, updated, and removed.


User Info Structure
---------------------------------------------------------------------

- A storage object will have a unique root member to store internal object metadata.
	This structure is static and IS maintained by the library code.
	- `__info`
		- `__info.id`: The object's unique id, required by the interface functions.
		- `__info.created_at`: The creation timestamp (zulu).
		- `__info.updated_at`: The modification timestamp (zulu).
		- `__info.owner_id`: The `User.user_id` of the object's owner.
		- `__info.readers`: Array of `User.user_id`s that have read access to this object.
		- `__info.writers`: Array of `User.user_id`s that have read/write access to this object.
		- `__info.public`: Boolean flag marking this object as public.


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


