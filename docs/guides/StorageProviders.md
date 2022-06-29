
# Storage Providers

A storage provider connects an application to a single collection of objects.

- `MongoProvider`
	- Stores objects in a MongoDB database.

- `JsonProvider`
	- Stores objects locally in memory.
	- Configuration options exist to read the contents of the collection from a disk file.
	- Configuration options exist to flush the contents of the collection back to the same disk file.
	- When using `flush_every_ms`  configuration option,
		take care to explicitly call the `Flush()` function as the application is shutting down.
		Failure to do so will likely result in the disk file being inaccurate.


Storage Provider Interface
---------------------------------------------------------------------

Each storage provider (e.g. `MongoProvider` and `JsonProvider`) implement a common interface and,
through configuration, can be used interchangeably by the application.
An instance of a storage provider allows an application to work with a single collection of objects.

- `Flush ()`
	: Used to invoke any internal processes related to persisting in-memory objects.
	This function does nothing in the `MongoProvider` implementation.
	For `JsonProvider`, this function will write all in-memory objects to the configured disk file location.

- `Count ( Criteria )`
	: Returns the number of objects matched by `Criteria`.
	If `Criteria` is missing or empty, then the count all objects will be returned.

- `FindOne ( Criteria )`
	: Returns the first object matched by `Criteria`.
	If `Criteria` is missing or empty, then the first (random) object will be returned.

- `FindMany ( Criteria )`
	: Returns all objects matching `Criteria`.
	If `Criteria` is missing or empty, then all objects will be returned.

- `CreateOne ( DataObject )`
	: Adds a new object to the collection.
	The `DataObject` parameter will have an `_id` field added to it.
	If `DataObject._id` already exists, then it is overwritten.
	This function returns a copy of the modified `DataObject`.

- `WriteOne ( DataObject, Criteria )`
	: Replaces a single object within the collection.
	If `Criteria` is missing or empty, then `DataObject._id` must exist.
	If `Criteria` matches more than one object, then only the first one will be replaced.
	This function will return a `1` if the object was successfully found and replaced.
	Otherwise, it returns a `0` to indicate that no replacement was made.

- `DeleteOne ( Criteria )`
	: Removes a single object from the collection.
	If `Criteria` is missing or empty, then the first (random) object will be removed.
	This function will return a `1` if the object was successfully found and removed.
	Otherwise, it returns a `0` to indicate that no removal was performed.

- `DeleteMany ( Criteria )`
	: Removes all objects matching `Criteria`.
	If `Criteria` is missing or empty, then the all objects will be removed.
	This function returns the number of objects that were matched and removed.

