

const NPM_NODE_EXTERNALS = require( 'webpack-node-externals' );


module.exports =
{
	entry: './src/template-lib.js',
	output: {
		path: __dirname,
		filename: `../../dist/template-lib.min.js`,

		library: 'template_lib',
		libraryTarget: 'umd',

		// Fix to get umd to work; see: https://github.com/webpack/webpack/issues/6784
		globalObject: 'typeof self !== \'undefined\' ? self : this',

	},
	target: 'node', // in order to ignore built-in modules like path, fs, etc.
	externals:
		[
			NPM_NODE_EXTERNALS(), // in order to ignore all modules in node_modules folder
		],
};
