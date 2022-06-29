'use strict';


const LIB_USER_STORAGE = require( '../src/lib-user-storage.js' );
const LIB_USER_STORAGE_TESTS = require( './_UserStorageTests.js' );

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_UUID = require( 'uuid' );

const LIB_ASSERT = require( 'assert' );


//---------------------------------------------------------------------
describe( `020) UserStorage Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		// Make some fake users.
		let Alice = { user_id: 'alice@fake.com', user_role: 'admin' };
		let Bob = { user_id: 'bob@fake.com', user_role: 'user' };
		let Eve = { user_id: 'eve@fake.com', user_role: 'user' };


		//---------------------------------------------------------------------
		let session_id = LIB_UUID.v4();
		let test_object_count = 1000;
		let user_config = {
			throws_permission_errors: false, // Disable permission errors for testing.
			json_provider: {
				enabled: true,
				collection_name: 'test-objects',
				database_name: LIB_PATH.join( __dirname, '~temp' ),
				clear_collection_on_start: true,
				// flush_on_update: true, // For troubleshooting the tests.
			}
		};
		let user_storage = LIB_USER_STORAGE.NewUserStorage( user_config );


		//---------------------------------------------------------------------
		describe( `Collection Tests; ${test_object_count} objects`,
			function ()
			{


				//---------------------------------------------------------------------
				it( `Should create test objects`,
					async function ()
					{
						await LIB_USER_STORAGE_TESTS.CreateTestObjects( user_storage, Alice, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should count all objects`,
					async function ()
					{
						let object_count = await user_storage.Count( Alice, {} );
						LIB_ASSERT.ok( object_count > 0 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should read and write test objects`,
					async function ()
					{
						await LIB_USER_STORAGE_TESTS.ReadAndWriteTestObjects( user_storage, Alice, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should find all test objects`,
					async function ()
					{
						await LIB_USER_STORAGE_TESTS.FindAllTestObjects( user_storage, Alice, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should delete all test objects`,
					async function ()
					{
						await LIB_USER_STORAGE_TESTS.DeleteAllTestObjects( user_storage, Alice, session_id, test_object_count );
						return;
					} );


				return;
			} );


		return;
	} );
