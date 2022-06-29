"use strict";


//---------------------------------------------------------------------
function value_missing_null_empty( Value )
{
	if ( Value === null ) { return true; }
	switch ( typeof Value )
	{
		case 'undefined':
			return true;
		case 'string':
			if ( Value.length === 0 ) { return true; }
		case 'object':
			if ( Value === null ) { return true; }
			if ( Object.keys( Value ).length === 0 ) { return true; }
			break;
	}
	return false;
};


//---------------------------------------------------------------------
function value_missing( Value )
{
	if ( Value === null ) { return true; }
	if ( typeof Value === 'undefined' ) { return true; }
	return false;
};


//---------------------------------------------------------------------
function value_exists( Value )
{
	return !value_missing_null_empty( Value );
};


//---------------------------------------------------------------------
function MISSING_PARAMETER_ERROR( Name )
{
	return new Error( `Required parameter is missing: ${Name}` );
};


//---------------------------------------------------------------------
function READ_ACCESS_ERROR()
{
	return new Error( `User does not have read access to this object or the object does not exist.` );
};


//---------------------------------------------------------------------
function WRITE_ACCESS_ERROR()
{
	return new Error( `User does not have write access to this object.` );
};


//---------------------------------------------------------------------
function clone( Value )
{
	return JSON.parse( JSON.stringify( Value ) );
};


//---------------------------------------------------------------------
function merge_objects( ObjectA, ObjectB )
{
	let C = JSON.parse( JSON.stringify( ObjectA ) );

	function update_children( ParentA, ParentB )
	{
		Object.keys( ParentB ).forEach(
			key =>
			{
				let value = ParentB[ key ];
				if ( typeof ParentA[ key ] === 'undefined' )
				{
					ParentA[ key ] = JSON.parse( JSON.stringify( value ) );
				}
				else
				{
					if ( typeof value === 'object' )
					{
						// Merge objects.
						update_children( ParentA[ key ], value );
					}
					else
					{
						// Overwrite values.
						ParentA[ key ] = JSON.parse( JSON.stringify( value ) );
					}
				}
			} );
	}

	update_children( C, ObjectB );
	return C;
};


//---------------------------------------------------------------------
function zulu_timestamp()
{
	return ( new Date() ).toISOString();
};


//---------------------------------------------------------------------

exports.value_missing_null_empty = value_missing_null_empty;
exports.value_missing = value_missing;
exports.value_exists = value_exists;

exports.MISSING_PARAMETER_ERROR = MISSING_PARAMETER_ERROR;
exports.READ_ACCESS_ERROR = READ_ACCESS_ERROR;
exports.WRITE_ACCESS_ERROR = WRITE_ACCESS_ERROR;

exports.clone = clone;
exports.merge_objects = merge_objects;

exports.zulu_timestamp = zulu_timestamp;
