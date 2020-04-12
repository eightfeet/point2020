
const path = require('path');
const { DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const theme = require(__dirname + '/theme.config.js');

module.exports = (env, argv) => {
	// 环境
	const isUat = argv.isuat === 'true' ? true : false;
	const isPro = !isUat && argv.mode === 'production';
	const cdn = process.env.PUBLIC_PATH || null;
	const isDev = argv.mode === 'development';
	return {
		entry: './src/index.js',
		context: path.resolve(__dirname),
		output: {
			library: '___Points___',
			libraryTarget: 'umd',
			path: path.resolve(__dirname, 'dist'),
			filename: 'points.js',
			publicPath: cdn ? `${cdn}/` : './'
		},
		module: {
			rules: [
				{
					enforce: 'pre',
					test: /\.js$/,
					exclude: /node_modules/,
					loader: 'eslint-loader'
				},
				{
					test: /\.js$/,
					use: {
						loader: 'babel-loader'
					},
					exclude: /node_modules/
				}, {
					test: /\.(scss|css)$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'style-loader'
						},
						{
							loader: 'css-loader',
							options: {
								modules: {
									localIdentName: '[name][hash:base64:8]'
								},
								sourceMap: true
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								sourceMap: true
							}
						}, {
							loader: 'sass-loader',
							options: {
								sourceMap: true
							}
						}
					]
				}, {
					test: /\.(svg|woff2?|ttf|eot)(\?.*)?$/i,
					use: 'file-loader'
				}, {
					test: /\.(jpe?g|png|gif)$/,
					use: [
						{
							loader: 'url-loader',
							options: {
								limit: 8192
							}
						}
					]
				}, {
					test: /\.html$/,
					use: [
						{
							loader: 'html-loader',
							options: {
								minimize: true,
								removeComments: false,
								collapseWhitespace: false
							}
						}
					]
				}
			]
		},
		resolve: {
			extensions: ['.jsx', '.js', '.json', '.less', '.scss', '.css', '.html'],
			alias: {
				'~': path.resolve(__dirname, 'src') // root
			}
		},
		devtool: 'source-map',
		plugins: [
			new DefinePlugin({
				__BASEFONT__: JSON.stringify(theme.basefont),
				__UIWIDTH__: JSON.stringify(theme.width),
				__UAT__: isUat,
				__PRO__: isPro,
				__DEV__: isDev
			}),
			new HtmlWebpackPlugin({
				minify: {
					collapseWhitespace: true
				},
				hash : true,
				template: './src/index.html'
			})
		],
		optimization: {
			minimizer: [
				new UglifyJsPlugin({ sourceMap: true }),
				new OptimizeCSSAssetsPlugin({})
			]
		},
		devServer: {
			contentBase: path.join(__dirname, 'src'),
			compress: true,
			port: 9000,
			host: 'localhost',
			publicPath: '/',
			historyApiFallback: true,
			proxy: {
				'/scrmv2': {
					target: 'http://wx-test1.by-health.com',
					changeOrigin: true
				}
			}
		}
	};
};
