'use strict';


const LIB_ASSERT = require( 'assert' );

require( 'babel-polyfill' ); // Required for json-criteria.
const LIB_JSON_CRITERIA = require( 'json-criteria' );
/*
- `json-criteria` [NPM](https://www.npmjs.com/package/json-criteria) [GIT](https://github.com/mirek/node-json-criteria)
	- This library requires npm `babel-polyfill`.
	- Has a pretty similar mongo-like syntax.
	- Weekly downloads: 180
*/
/*
npm install --save babel-polyfill
npm install --save json-criteria
*/


//---------------------------------------------------------------------
describe( `json-criteria Tests: Matching`,
	function ()
	{


		//---------------------------------------------------------------------
		it( `Should perform a simple match`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( { foo: 1 }, { foo: 1 } ),
					true );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should perform a similar match`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( { foo: 1, bar: 1 }, { foo: 1 } ),
					true );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( { foo: 1, bar: 1 }, { bar: 1 } ),
					true );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should perform a nested match`,
			function ()
			{
				let object = {
					foo: {
						bar: 1,
						baz: 2,
					}
				};
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { foo: { bar: 1 } } ),
					true );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { foo: { baz: 2 } } ),
					true );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { foo: { bar: 1, baz: 2 } } ),
					true );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { 'foo.bar': 1 } ),
					true );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { 'foo.baz': 2 } ),
					true );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should perform an array match`,
			function ()
			{
				let object = {
					array: [ 'one', 'two', 'three', { four: 4 } ]
				};

				// Should
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { array: { $size: 4 } } ),
					true );

				// - Match a single element
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { array: { $elemMatch: 'two' } } ),
					true );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { array: { $in: 'two' } } ),
					true );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { 'array.1': 'two' } ),
					true );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { 'array.3.four': 4 } ),
					true );

				// - Match from an array of elements
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { array: [ 'one', 'two', 'three', { four: 4 } ] } ),
					true );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { array: { $in: [ 'one', 'three' ] } } ),
					true );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { array: { $in: [ 'one', 'four' ] } } ),
					true );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { array: { $all: [ 'one', 'three' ] } } ),
					true );

				// Shouldn't
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { array: { $elemMatch: 'four' } } ),
					false );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { array: { $in: 'four' } } ),
					false );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { array: { $all: [ 'one', 'four' ] } } ),
					false );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { array: { $in: { four: 4 } } } ),
					false );
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( object, { array: { $in: [ { four: 4 } ] } } ),
					false );

				return;
			} );


		return;
	} );


//---------------------------------------------------------------------
describe( `json-criteria Tests: Not Matching`,
	function ()
	{


		//---------------------------------------------------------------------
		it( `Should not match 'undefined'`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( { foo: 1 } ),
					false );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should not match 'null'`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( { foo: 1 }, null ),
					false );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should not match empty object '{}'`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( { foo: 1 }, {} ),
					false );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should not match different values`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( { foo: 1 }, { foo: 2 } ),
					false );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should not match different objects`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					LIB_JSON_CRITERIA.test( { foo: 1 }, { bar: 1 } ),
					false );
				return;
			} );


		return;
	} );


