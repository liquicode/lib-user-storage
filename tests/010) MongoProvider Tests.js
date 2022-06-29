'use strict';


const LIB_MONGO_PROVIDER = require( '../src/StorageProviders/MongoProvider.js' );
const LIB_STORAGE_PROVIDER_TESTS = require( './_StorageProviderTests.js' );

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_UUID = require( 'uuid' );

const LIB_ASSERT = require( 'assert' );


//---------------------------------------------------------------------
describe( `010) MongoProvider Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		let filename = LIB_PATH.join( __dirname, '../build/__secrets/test-mongodb-config.json' );
		let provider_config = JSON.parse( LIB_FS.readFileSync( filename, 'utf8' ) );
		provider_config.enabled = true;
		let storage_provider = LIB_MONGO_PROVIDER.NewMongoProvider( provider_config );


		//---------------------------------------------------------------------
		describe( `Collection Tests; 10 objects`,
			function ()
			{
				let session_id = LIB_UUID.v4();
				let test_object_count = 10;


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
