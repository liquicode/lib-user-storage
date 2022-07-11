
# Basic Storage Example

Store some data
---------------------------------------------------------------------

```javascript
const LIB_USER_STORAGE = require( '@liquicode/lib-user-storage' );

// Create a UserStorage object that we can use to store objects.
let storage = LIB_USER_STORAGE.NewUserStorage(); // Defaults to an in-memory json array.

// Get a user to work with.
let user = LIB_USER_STORAGE.Administrator(); // Using built-in Admin account.

// Construct some data that we want to save.
let user_data = {
	name: 'About Me',
	text: 'I am a system user!',
	is_admin: (user.user_role === 'admin'),
};

// Store that data.
let stored_data = await storage.CreateOne( user, user_data );
```

The resulting stored data looks like this:

```javascript
stored_data == {
	name: 'About Me',
	text: 'I am a system user!',
	is_admin: true,
	__: {	// Every stored object contains special info in its '__' field.
		id = 'cda0f50e-84b4-4a4e-91f5-29f73a00ffbb',	// unique id for this object.
		created_at: '2022-06-30T03:45:24.415Z',			// Timestamp of when this object was created.
		updated_at: '2022-06-30T03:45:24.415Z',			// Timestamp of when this object was last updated.
		owner_id = "admin@lib-user-storage",			// User Identifier (anything unique to the user).
		readers = [],									// Array of user ids that have read access.
		writers = [],									// Array of user ids that have write access.
		public = false,									// Flag to give everyone read access to this object.
	}
};
```

You can later find this data using `FindOne()`:

```javascript
// Find by matching the value of 'stored_data.__.id' implicitely.
found_data = await storage.FindOne( user, stored_data );

// Find by matching the value of 'stored_data.__.id' explicitely.
found_data = await storage.FindOne( user, stored_data.__.id );

// Find by matching specific values.
found_data = await storage.FindOne( user, { name: 'About Me' } );
```

You can also update it using `WriteOne()`:

```javascript
updated_data = await storage.WriteOne( user, stored_data, { is_updated: true } );
updated_data == {
	name: 'About Me',
	text: 'I am a system user!',
	is_admin: true,
	is_updated: true,
	__: { /* storage info */ },
};
```
