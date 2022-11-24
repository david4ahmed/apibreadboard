const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
	// Build Mode
	mode: 'development',

	// Electron Entry
	entry: './src/index.ts',
	// target: 'electron-main',
	resolve: {
		alias: {
			['@']: path.resolve(__dirname, 'src'),
		},
		extensions: ['.tsx', '.ts', '.js'],
		modules: ['node_modules'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				include: /src/,
				use: [{ loader: 'ts-loader' }],
			},
		],
	},
	target: 'electron-main',
	externals: [nodeExternals()],
	output: {
		path: __dirname + '/dist',
		filename: 'index.js',
	},
	plugins: [
		new CopyPlugin({
			patterns: [{ from: 'src/assets', to: 'assets' }],
		}),
	],
};
