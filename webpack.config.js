const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const Bs = require('browser-sync');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const isDev = process.env.NODE_ENV === 'dev';

/*---- Javascript config -----------------------------------------------------------------------*/
const JS = {
  name: 'js',
  context: path.resolve('./src/js/'),
  watch: isDev,
  devtool: isDev ? 'inline-source-map' : false,
  entry: {
    scratchcard: './ScratchCard.ts',
    '../../../build/scratchcard': './ScratchCard.ts'
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].bundle.js',
    path: __dirname + '/docs/js/lib',
    library: undefined,
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: [ ".tsx", ".ts", ".js" ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['babel-loader','ts-loader'],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new BrowserSyncPlugin({
      // browse to http://localhost:3000/ during development, 
      // ./public directory is being served 
      host: 'localhost',
      port: 3000,
      server: { baseDir: ['docs'] },
      files: ['./src/js/**/*.ts', './src/scss/**/*.scss']
    })
  ]
};

/*---- SCSS / CSS config -----------------------------------------------------------------------*/
const SCSS = {
  context: path.resolve('./src/scss/'),
  name: 'scss',
  watch: isDev,
  entry: {
    styles: ['./style.scss']
  },
  output: {
    filename: 'style.css',
    path: __dirname + '/docs/css'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {loader: 'css-loader', options: {importLoaders: 1, minimize: !isDev}},
            {loader: 'resolve-url-loader'},
            {loader: 'postcss-loader', options: {
              plugins: (loader) => [
                require('autoprefixer')()
              ]
            }},
            {loader: 'sass-loader'}
          ]
        }),
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'style.css',
      allChunks: true,
    })
  ]
};

/*---- For production -----------------------------------------------------------------------*/
if (!isDev) {
  JS.output.filename = '[name].min.js';
  JS.plugins.push(new CleanWebpackPlugin(['dist/js'], { // remove ./dist/js
    root: path.resolve('./'),
    verbose: true,
    dry: true,
  }));
  JS.plugins.push(new UglifyJsPlugin());
  SCSS.plugins.push(new CleanWebpackPlugin(['docs/css'], { // remove ./dist/css
    root: path.resolve('./'),
    verbose: true,
    dry: true,
  }));
}

/*---- Export -----------------------------------------------------------------------*/
module.exports = [JS, SCSS];
