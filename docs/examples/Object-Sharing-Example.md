# Object Sharing Example

Create a collection of objects owned by different users
---------------------------------------------------------------------

Here we have 3 different users: Alice, Bob, and Eve.
Each user has documents that are private to them.
These documents can be made `public` (read-only to all) and/or can be shared with specific users
who are given read-only or read-write access to specific documents.

Alice's `User` object has the `admin` role, which allows her to read and write the documents of all users.
She creates three documents.
One document is marked as `public` that will be readable by all users.
She also has a document to which Bob is a `Writer` (has read/write access) and Eve is a `Reader` (has read-only access).
Eve has a third document to which only Bob is a `Reader`.

Bob and Eve both have the `user` role which allows them to create, read, write, and delete only their own documents.
Bob has two private documents and Eve has a single private document.

```javascript
const LIB_USER_STORAGE = require( '@liquicode/lib-user-storage' );

// Make some fake users.
let Alice = { user_id: 'alice@fake.com', user_role: 'admin' };
let Bob = { user_id: 'bob@fake.com', user_role: 'user' };
let Eve = { user_id: 'eve@fake.com', user_role: 'user' };

// Get the user storage.
let storage = LIB_USER_STORAGE.NewUserStorage(); // Defaults to an in-memory json array.
let doc = null;

// Create some documents for Alice.
doc = await storage.CreateOne( Alice, { name: 'Public Document', text: 'This is a public document.' } );
await storage.Share( Alice, doc, null, null, true ); // Share this doc with everyone.

doc = await storage.CreateOne( Alice, { name: 'Internal Document', text: 'This is an internal document.' } );
await storage.Share( Alice, doc, null, Bob.user_id ); // Give read and write access to Bob.
await storage.Share( Alice, doc, Eve.user_id ); // Give read-only access to Eve.

doc = await storage.CreateOne( Alice, { name: 'Secret Document', text: 'This is a secret document.' } );
await storage.Share( Alice, doc, Bob.user_id ); // Give read-only access to Bob.

// Create some documents for Bob.
doc = await storage.CreateOne( Bob, { name: 'My Document', text: 'This is my document.' } );
doc = await storage.CreateOne( Bob, { name: 'My Document 2', text: 'This is my other document.' } );

// Create a document for Eve.
doc = await storage.CreateOne( Eve, { name: 'Evil Plans', text: 'Step 1: Take over the world.' } );

```


Users can manipulate objects that they own
---------------------------------------------------------------------

Users have access to the documents they create.
When reading objects from `UserStorage`, a `UserObject` will be returned.
This object will have a `_m` field containing the object's management state and
a `_o` field containing the application data for the object.

It is not advisable to modify the contents of the `_m` field.
During updates, only the `_o` portion of the object is saved.
The contents of the `_m` field will not be updated. 

```javascript
// Alice can read and write her own documents.
doc = await storage.FindOne( Alice, { name: 'Public Document' } );
// doc._m.id = "f02ca9..."
// doc._m.owner_id = "alice@fake.com"
// doc._m.readers = []
// doc._m.writers = []
// doc._m.public = true
doc._o.text = 'Updated document content.';
count = await storage.WriteOne( Alice, doc );
// count = 1, if successful.

// Alice can read and write other user's own documents.
doc = await storage.FindOne( Alice, { name: 'My Document' } ); // Read one of Bob's documents.
doc._o.text += ' I approve!'; // Modify the document content.
doc_0.approved = true; // Add a field.
count = await storage.WriteOne( Alice, doc ); // Update the document.

// Eve can read and write her own documents.
doc = await storage.FindOne( Eve, { name: 'Evil Plans' } );
doc += ' Step 2: Profit!'
count = await storage.WriteOne( Eve, doc ); // Update the document.

```


Users cannot read each other's objects
---------------------------------------------------------------------

```javascript

// Bob cannot read Eve's documents.
doc = await storage.FindOne( Bob, { name: 'Evil Plans' } );
// doc = null


```
