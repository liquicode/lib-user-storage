'use strict';


const LIB = require( '../src/lib-user-storage.js' );
const LIB_ASSERT = require( 'assert' );

//---------------------------------------------------------------------
describe( `000) Base Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		describe( `Assert Tests`,
			async function ()
			{

				//---------------------------------------------------------------------
				it( `LIB_ASSERT.ok( true )`,
					async function ()
					{
						LIB_ASSERT.ok( true );
						return;
					} );

				//---------------------------------------------------------------------
				it( `LIB_ASSERT.strictEqual( 1, 1 )`,
					async function ()
					{
						LIB_ASSERT.strictEqual( 1, 1 );
						return;
					} );

				//---------------------------------------------------------------------
				it( `LIB_ASSERT.notStrictEqual( 0, 1 )`,
					async function ()
					{
						LIB_ASSERT.notStrictEqual( 0, 1 );
						return;
					} );

				return;
			} );


		return;
	} );
