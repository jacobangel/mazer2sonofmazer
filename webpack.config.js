const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/*
 * We've enabled UglifyJSPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/uglifyjs-webpack-plugin
 *
 */

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

/*
 * We've enabled Postcss, autoprefixer and precss for you. This allows your app
 * to lint  CSS, support variables and mixins, transpile future CSS syntax,
 * inline images, and more!
 *
 * To enable SASS or LESS, add the respective loaders to module.rules
 *
 * https://github.com/postcss/postcss
 *
 * https://github.com/postcss/autoprefixer
 *
 * https://github.com/jonathantneal/precss
 *
 */

const autoprefixer = require('autoprefixer');
const precss = require('precss');

module.exports = {
	entry: './index.js',

	output: {
		filename: '[name].bundle.js',
		path: path.resolve('./public')
	},

	module: {
		rules: [
			{
				test: /\.js(x)?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',

				options: {
					presets: ["stage-3", "es2015", "react"]
				}
			},
			{
				test: /\.css$/,

				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader',

						options: {
							sourceMap: true,
							modules: true,
							importLoaders: 1
						}
					},
					{
						loader: 'postcss-loader',

						options: {
							plugins: function() {
								return [precss, autoprefixer];
							}
						}
					}
				]
			}
		]
	},

	plugins: [
	// 	new UglifyJSPlugin(),
		new HtmlWebpackPlugin({
			title: "Mazer",
			template: "./index.ejs",
		})
	]
};
