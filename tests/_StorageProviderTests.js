'use strict';

const LIB_ASSERT = require( 'assert' );


//---------------------------------------------------------------------
exports.CreateTestObjects =
	async function CreateTestObjects( Provider, SessionID, TestObjectCount )
	{

		// Create a number of objects.
		for ( let number = 1; number <= TestObjectCount; number++ )
		{
			let data_object = {
				session_id: SessionID,
				order_number: number,
			};

			// Create the object.
			let new_data_object = null;
			try 
			{
				new_data_object = await Provider.CreateOne( data_object );
			}
			catch ( error ) 
			{
				console.error( error );
			}
			LIB_ASSERT.ok( new_data_object._id );
			LIB_ASSERT.ok( data_object._id );
			LIB_ASSERT.strictEqual( new_data_object._id, data_object._id );
			LIB_ASSERT.strictEqual( new_data_object.session_id, data_object.session_id );
			LIB_ASSERT.strictEqual( new_data_object.order_number, data_object.order_number );
		}

		// Get the object count.
		let object_count = 0;
		try
		{
			object_count = await Provider.Count( { session_id: SessionID } );
		}
		catch ( error )
		{
			console.error( error );
		}
		LIB_ASSERT.strictEqual( object_count, TestObjectCount );

		return;
	};


//---------------------------------------------------------------------
exports.ReadAndWriteTestObjects =
	async function ReadAndWriteTestObjects( Provider, SessionID, TestObjectCount )
	{

		// Test all of the objects.
		for ( let number = 1; number <= TestObjectCount; number++ )
		{
			let data_object = {
				session_id: SessionID,
				order_number: number,
			};

			// Find the object.
			let new_data_object = null;
			try
			{
				new_data_object = await Provider.FindOne( data_object );
			}
			catch ( error )
			{
				console.error( error );
			}
			LIB_ASSERT.ok( new_data_object._id );
			LIB_ASSERT.strictEqual( data_object._id, undefined );
			LIB_ASSERT.strictEqual( new_data_object.session_id, data_object.session_id );
			LIB_ASSERT.strictEqual( new_data_object.order_number, data_object.order_number );

			// Modify the object.
			let object_count = 0;
			try
			{
				data_object.order_number += 1000;
				object_count = await Provider.WriteOne( data_object, { _id: new_data_object._id } );
			}
			catch ( error )
			{
				console.error( error );
			}
			LIB_ASSERT.strictEqual( object_count, 1 );

			// Find the object again.
			try
			{
				new_data_object = await Provider.FindOne( { _id: new_data_object._id } );
			}
			catch ( error )
			{
				console.error( error );
			}
			LIB_ASSERT.ok( new_data_object );
			LIB_ASSERT.ok( new_data_object._id );
			LIB_ASSERT.strictEqual( new_data_object.session_id, data_object.session_id );
			LIB_ASSERT.strictEqual( new_data_object.order_number, data_object.order_number );

		}

		// Get the object count.
		let object_count = 0;
		try
		{
			object_count = await Provider.Count( { session_id: SessionID } );
		}
		catch ( error )
		{
			console.error( error );
		}
		LIB_ASSERT.strictEqual( object_count, TestObjectCount );

		return;
	};


//---------------------------------------------------------------------
exports.FindAllTestObjects =
	async function FindAllTestObjects( Provider, SessionID, TestObjectCount )
	{
		// Find all objects in session.
		let data_objects = null;
		try
		{
			data_objects = await Provider.FindMany( { session_id: SessionID } );
		}
		catch ( error )
		{
			console.error( error );
		}
		LIB_ASSERT.strictEqual( data_objects.length, TestObjectCount );
		return;
	};


//---------------------------------------------------------------------
exports.DeleteAllTestObjects =
	async function DeleteAllTestObjects( Provider, SessionID, TestObjectCount )
	{
		// Delete all objects in session.
		let object_count = 0;
		try
		{
			object_count = await Provider.DeleteMany( { session_id: SessionID } );
		}
		catch ( error )
		{
			console.error( error );
		}
		LIB_ASSERT.strictEqual( object_count, TestObjectCount );

		// Get the object count.
		object_count = 0;
		try
		{
			object_count = await Provider.Count( { session_id: SessionID } );
		}
		catch ( error )
		{
			console.error( error );
		}
		LIB_ASSERT.strictEqual( object_count, 0 );

		return;
	};

