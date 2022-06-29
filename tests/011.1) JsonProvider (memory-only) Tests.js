'use strict';


const LIB_JSON_PROVIDER = require( '../src/StorageProviders/JsonProvider.js' );
const LIB_STORAGE_PROVIDER_TESTS = require( './_StorageProviderTests.js' );

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_UUID = require( 'uuid' );

const LIB_ASSERT = require( 'assert' );


//---------------------------------------------------------------------
describe( `011.1) JsonProvider (memory-only) Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		let session_id = '';
		let test_object_count = 0;
		let provider_config = null;
		let storage_filename = '';
		let storage_provider = null;


		//---------------------------------------------------------------------
		before(
			function ()
			{
				// Configure the test environment.
				session_id = LIB_UUID.v4();
				test_object_count = 1000;
				provider_config = {
					collection_name: 'test-objects',
					database_name: LIB_PATH.join( __dirname, '~temp' ),
					flush_on_update: false,
					flush_every_ms: 0,
				};
				// Reset the test environment.
				if ( !LIB_FS.existsSync( provider_config.database_name ) ) { LIB_FS.mkdirSync( provider_config.database_name ); }
				storage_filename = LIB_PATH.join( provider_config.database_name, provider_config.collection_name );
				if ( !storage_filename.toLowerCase().endsWith( '.json' ) ) { storage_filename += '.json'; }
				if ( LIB_FS.existsSync( storage_filename ) ) { LIB_FS.unlinkSync( storage_filename ); }
				// Get the storage provider.
				storage_provider = LIB_JSON_PROVIDER.NewJsonProvider( provider_config );
			} );


		//---------------------------------------------------------------------
		after(
			function ()
			{
				storage_provider.Flush();
			} );


		//---------------------------------------------------------------------
		describe( `Collection Tests; ${test_object_count} objects, memory only`,
			function ()
			{


				//---------------------------------------------------------------------
				it( `Should create test objects`,
					async function ()
					{
						await LIB_STORAGE_PROVIDER_TESTS.CreateTestObjects( storage_provider, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should read and write test objects`,
					async function ()
					{
						await LIB_STORAGE_PROVIDER_TESTS.ReadAndWriteTestObjects( storage_provider, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should find all test objects`,
					async function ()
					{
						await LIB_STORAGE_PROVIDER_TESTS.FindAllTestObjects( storage_provider, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should delete all test objects`,
					async function ()
					{
						await LIB_STORAGE_PROVIDER_TESTS.DeleteAllTestObjects( storage_provider, session_id, test_object_count );
						return;
					} );


				return;
			} );


		return;
	} );
