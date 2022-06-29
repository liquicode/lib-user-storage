'use strict';

const LIB_ASSERT = require( 'assert' );


//---------------------------------------------------------------------
exports.CreateTestObjects =
	async function CreateTestObjects( Storage, User, SessionID, TestObjectCount )
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
				new_data_object = await Storage.CreateOne( User, data_object );
			}
			catch ( error ) 
			{
				console.error( error );
			}
			let user_info = Storage.GetUserInfo( new_data_object );
			LIB_ASSERT.ok( user_info.id );
			let user_data = Storage.GetUserData( new_data_object );
			LIB_ASSERT.deepStrictEqual( user_data, data_object );
		}

		// Get the object count.
		let object_count = 0;
		try
		{
			object_count = await Storage.Count( User, { session_id: SessionID } );
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
	async function ReadAndWriteTestObjects( Storage, User, SessionID, TestObjectCount )
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
				new_data_object = await Storage.FindOne( User, data_object );
			}
			catch ( error )
			{
				console.error( error );
			}
			let user_info = Storage.GetUserInfo( new_data_object );
			LIB_ASSERT.ok( user_info.id );
			let user_data = Storage.GetUserData( new_data_object );
			LIB_ASSERT.deepStrictEqual( user_data, data_object );

			// Modify the object.
			let object_count = 0;
			try
			{
				new_data_object.order_number += 1000;
				object_count = await Storage.WriteOne( User, new_data_object, new_data_object );
			}
			catch ( error )
			{
				console.error( error );
			}
			LIB_ASSERT.strictEqual( object_count, 1 );

			// Find the object again.
			try
			{
				data_object.order_number += 1000;
				new_data_object = await Storage.FindOne( User, data_object );
			}
			catch ( error )
			{
				console.error( error );
			}
			LIB_ASSERT.ok( new_data_object );
			user_info = Storage.GetUserInfo( new_data_object );
			LIB_ASSERT.ok( user_info.id );
			user_data = Storage.GetUserData( new_data_object );
			LIB_ASSERT.deepStrictEqual( user_data, data_object );

		}

		// Get the object count.
		let object_count = 0;
		try
		{
			object_count = await Storage.Count( User, { session_id: SessionID } );
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
	async function FindAllTestObjects( Storage, User, SessionID, TestObjectCount )
	{
		// Find all objects in session.
		let data_objects = null;
		try
		{
			data_objects = await Storage.FindMany( User, { session_id: SessionID } );
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
	async function DeleteAllTestObjects( Storage, User, SessionID, TestObjectCount )
	{
		// Delete all objects in session.
		let object_count = 0;
		try
		{
			object_count = await Storage.DeleteMany( User, { session_id: SessionID } );
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
			object_count = await Storage.Count( User, { session_id: SessionID } );
		}
		catch ( error )
		{
			console.error( error );
		}
		LIB_ASSERT.strictEqual( object_count, 0 );

		return;
	};

