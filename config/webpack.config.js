const path = require("path");
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ChromeExtensionReloader  = require('webpack-chrome-extension-reloader');

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';

  const plugins = [
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    // vue-loader requirement
    new VueLoaderPlugin(),
    // extract css into files
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    // reduce moment.js file size
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /ko/),
    // analyze bundle
    //new BundleAnalyzerPlugin(),
    // create HTML files
    new HtmlWebpackPlugin({filename: 'popup.html', template: 'src/assets/html/popup.html', chunks: ['popup', 'vendor']}),
    new HtmlWebpackPlugin({filename: 'popup-request.html', template: 'src/assets/html/popup-request.html', chunks: ['popup', 'vendor']}),
    new HtmlWebpackPlugin({filename: 'tab.html', template: 'src/assets/html/tab.html', chunks: ['popup', 'vendor']}),
    new HtmlWebpackPlugin({filename: 'background.html', template: 'src/assets/html/background.html', chunks: ['background', 'vendor']}),
  ];

  if (devMode) {
    // hot-reload for development
    plugins.push(new ChromeExtensionReloader({
      reloadPage: false
    }));
  }

  return {
    mode: devMode ? 'development' : 'production',
    entry: {
      'background': 'src/background.js',
      'content-script': 'src/content-script.js',
      'popup': 'src/popup.js',
    },
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: '[name].js',
      chunkFilename: '[name].js',
      publicPath: devMode && 0 ? '/dist' : ''
    },
    plugins,
    module: {
      rules: [
        // Vue.js
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        // JS, compiled with Babel
        {
          test: /\.js$/,
          use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            }
          },
        ]
        },
        // CSS, inline for hot-reloading during development or extracted for production
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            //{ loader: 'file-loader', options: { name: '[name].css' } },
            devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            //MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: 'postcss-loader',
              options: {
                config: {
                  path: 'config/postcss.config.js'
                },
              },
            },
            "sass-loader",
          ]
        },
        // Manifest files
        {
          test: /manifest\.json$/,
          use: [
            { loader: 'file-loader', options: { name: '[name].[ext]' } },
            { loader: 'extricate-loader' },
            { loader: 'interpolate-loader' }
          ],
          type: 'javascript/auto'
        },
        {
          test: /package\.json$/,
          use: [],
          type: 'javascript/auto',
          exclude: /node_modules/
        },
        // Images, inline up to a certain size
        {
          test: /\.(svg)$/,
          use: [
            { loader: "url-loader?limit=10000" },
            { loader: 'image-webpack-loader' }, // optimize
          ]
        },
        { test: /\.(png)$/, loader: "url-loader?limit=1"},
        // Fonts, always external
        { test: /\.(otf|swf|eot|ttf|woff|woff2)$/, loader: "url-loader?limit=1"}
      ]
    },
    devtool: (() => {
			if (devMode) return 'cheap-source-map';
		  return 'source-map';
		})(),
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': path.resolve(__dirname, '..'),
        '@assets': path.resolve(__dirname, '..', 'src/assets'),
        'vue$': 'vue/dist/vue.runtime.esm.js',
        '@herajs/client': '@herajs/client/dist/herajs.js'
      },
      modules: [
        path.resolve(__dirname, '..', 'node_modules'),
        path.resolve(__dirname, '..'),
        'node_modules'
      ]
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: 'vendor',
      },
    }
  };
};