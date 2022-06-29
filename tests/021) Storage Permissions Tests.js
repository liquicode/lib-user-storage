'use strict';


const LIB_USER_STORAGE = require( '../src/lib-user-storage.js' );

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_UUID = require( 'uuid' );

const LIB_ASSERT = require( 'assert' );


//---------------------------------------------------------------------
describe( `021) Storage Permissions Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		describe( `Alice, Bob, and Eve scenario`,
			function ()
			{
				// Make some fake users.
				let Alice = { user_id: 'alice@fake.com', user_role: 'admin' };
				let Bob = { user_id: 'bob@fake.com', user_role: 'user' };
				let Eve = { user_id: 'eve@fake.com', user_role: 'user' };

				// Configure the test environment.
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

				// Get the user storage.
				let storage = LIB_USER_STORAGE.NewUserStorage( user_config );


				//---------------------------------------------------------------------
				async function _TestUserReadAccess( User, DocumentNames )
				{
					// Test the number of objects accessible.
					{
						let count = await storage.Count( User );
						LIB_ASSERT.strictEqual( count, DocumentNames.length );
					}

					// Test the results of FindOne.
					{
						for ( let index = 0; index < DocumentNames.length; index++ )
						{
							let document_name = DocumentNames[ index ];
							let doc = await storage.FindOne( User, { name: document_name } );
							LIB_ASSERT.ok( doc !== null );
							LIB_ASSERT.strictEqual( doc.name, document_name );
						}
					}

					// Test the results of FindMany.
					{
						let objects = await storage.FindMany( User );
						LIB_ASSERT.strictEqual( objects.length, DocumentNames.length );
						for ( let index = 0; index < objects.length; index++ )
						{
							let object = objects[ index ];
							LIB_ASSERT.ok( DocumentNames.includes( object.name ) );
						}
					}

					return;
				}


				//---------------------------------------------------------------------
				async function _TestUserWriteAccess( User, DocumentNames )
				{
					// Test the results of WriteOne.
					{
						for ( let index = 0; index < DocumentNames.length; index++ )
						{
							let document_name = DocumentNames[ index ];
							let doc = await storage.FindOne( User, { name: document_name } );
							LIB_ASSERT.ok( doc !== null );
							LIB_ASSERT.strictEqual( doc.name, document_name );
							doc.text = "I overwrote your message.";
							let count = storage.WriteOne( User, doc );
						}
					}
					return;
				}


				//---------------------------------------------------------------------
				async function _RebuildTestEnvironment()
				{
					try
					{
						let doc = null;
						await storage.DeleteMany( Alice );

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
					}
					catch ( error )
					{
						console.error( error );
					}
					return;
				}


				//---------------------------------------------------------------------
				it( `Should add documents and set permissions`,
					async function ()
					{
						await _RebuildTestEnvironment();
						return;
					} );


				//---------------------------------------------------------------------
				it( `Alice should read all documents and write all documents`,
					async function ()
					{
						await _RebuildTestEnvironment();
						await _TestUserReadAccess(
							Alice,
							[
								'Public Document',
								'Internal Document',
								'Secret Document',
								'My Document',
								'My Document 2',
								'Evil Plans',
							] );
						await _TestUserWriteAccess(
							Alice,
							[
								'Public Document',
								'Internal Document',
								'Secret Document',
								'My Document',
								'My Document 2',
								'Evil Plans',
							] );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Bob should read some documents and write some documents`,
					async function ()
					{
						await _RebuildTestEnvironment();
						await _TestUserReadAccess(
							Bob,
							[
								'Public Document',
								'Internal Document',
								'Secret Document',
								'My Document',
								'My Document 2',
								// 'Evil Plans',
							] );
						await _TestUserWriteAccess(
							Bob,
							[
								// 'Public Document',
								'Internal Document',
								// 'Secret Document',
								'My Document',
								'My Document 2',
								// 'Evil Plans',
							] );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Eve should read some documents and write some documents`,
					async function ()
					{
						await _RebuildTestEnvironment();
						await _TestUserReadAccess(
							Eve,
							[
								'Public Document',
								'Internal Document',
								// 'Secret Document',
								// 'My Document',
								// 'My Document 2',
								'Evil Plans',
							] );
						await _TestUserWriteAccess(
							Eve,
							[
								// 'Public Document',
								// 'Internal Document',
								// 'Secret Document',
								// 'My Document',
								// 'My Document 2',
								'Evil Plans',
							] );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Public objects should be readable by everyone`,
					async function ()
					{
						await _RebuildTestEnvironment();
						let doc = null;

						doc = await storage.FindOne( Alice, { name: 'Public Document' } );
						LIB_ASSERT.ok( doc );
						LIB_ASSERT.strictEqual( doc.name, 'Public Document' );

						doc = await storage.FindOne( Bob, { name: 'Public Document' } );
						LIB_ASSERT.ok( doc );
						LIB_ASSERT.strictEqual( doc.name, 'Public Document' );

						doc = await storage.FindOne( Eve, { name: 'Public Document' } );
						LIB_ASSERT.ok( doc );
						LIB_ASSERT.strictEqual( doc.name, 'Public Document' );

						return;
					} );


				//---------------------------------------------------------------------
				it( `Public objects should only be writable by the owner`,
					async function ()
					{
						await _RebuildTestEnvironment();
						let original_doc = await storage.FindOne( Alice, { name: 'Public Document' } );
						LIB_ASSERT.ok( original_doc );

						// Bob cannot update the public document.
						{
							// Get the document.
							let doc = await storage.FindOne( Bob, { name: 'Public Document' } );
							// Edit the document.
							doc.text = "I have overwritten your message.";
							// Attempt to save the document.
							let count = await storage.WriteOne( Bob, doc );
							LIB_ASSERT.strictEqual( count, 0 ); // Write failed.
							// Read thew document again.
							doc = await storage.FindOne( Bob, { name: 'Public Document' } );
							LIB_ASSERT.deepStrictEqual( original_doc, doc );
						}

						// Eve cannot update the public document.
						{
							// Get the document.
							let doc = await storage.FindOne( Eve, { name: 'Public Document' } );
							// Edit the document.
							doc.text = "I have overwritten your message.";
							// Attempt to save the document.
							let count = await storage.WriteOne( Eve, doc );
							LIB_ASSERT.strictEqual( count, 0 ); // Write failed.
							// Read thew document again.
							doc = await storage.FindOne( Eve, { name: 'Public Document' } );
							LIB_ASSERT.deepStrictEqual( original_doc, doc );
						}

						return;
					} );


				//---------------------------------------------------------------------
				it( `Should not allow readers to update documents`,
					async function ()
					{
						await _RebuildTestEnvironment();
						
						// Bob can read, but not update, the document 'Secret Document'.
						{
							let original_doc = await storage.FindOne( Alice, { name: 'Secret Document' } );
							LIB_ASSERT.ok( original_doc );
							// Get the document.
							let doc = await storage.FindOne( Bob, { name: 'Secret Document' } );
							// Edit the document.
							doc.text = "I have overwritten your message.";
							// Attempt to save the document.
							let count = await storage.WriteOne( Bob, doc );
							LIB_ASSERT.strictEqual( count, 0 ); // Write failed.
							// Read thew document again.
							doc = await storage.FindOne( Bob, { name: 'Secret Document' } );
							LIB_ASSERT.deepStrictEqual( original_doc, doc );
						}

						// Eve can read, but not update, the document 'Internal Document'.
						{
							let original_doc = await storage.FindOne( Alice, { name: 'Internal Document' } );
							LIB_ASSERT.ok( original_doc );
							// Get the document.
							let doc = await storage.FindOne( Eve, { name: 'Internal Document' } );
							// Edit the document.
							doc.text = "I have overwritten your message.";
							// Attempt to save the document.
							let count = await storage.WriteOne( Eve, doc );
							LIB_ASSERT.strictEqual( count, 0 ); // Write failed.
							// Read thew document again.
							doc = await storage.FindOne( Eve, { name: 'Internal Document' } );
							LIB_ASSERT.deepStrictEqual( original_doc, doc );
						}

						return;
					} );


				return;
			} );


		return;
	} );
