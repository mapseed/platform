const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const webpack = require("webpack");

require('dotenv').config({path: 'src/.env'});
require("babel-polyfill");
var path = require('path');
var glob = require('glob');
var fs = require('fs');
const shell = require('shelljs');

const PORT = 8000;

if (!process.env.FLAVOR) {
  process.exitCode = 1;
  process.exit();
}

const distPath = path.resolve(
  __dirname,
  "www/dist"
);

// clean out the output directory and recreate it
shell.rm('-rf', distPath);
shell.mkdir('-p', distPath);

var flavorJsFiles = glob.sync("./src/flavors/" + process.env.FLAVOR + "/static/js/*.js");
var entryPoints = [
  "babel-polyfill",
  "./src/base/static/js/routes.js",
  "./src/base/static/js/handlebars-helpers.js",
  "./src/base/static/scss/default.scss",
  "./src/base/static/css/quill.snow.css",
  "./src/base/static/css/jquery.datetimepicker.css",
  "./src/base/static/css/leaflet.draw.css",
  "./src/base/static/css/leaflet-sidebar.css",
  "./src/base/static/css/spectrum.css",
  "./src/flavors/" + process.env.FLAVOR + "/static/css/custom.css",
  "./src/flavors/" + process.env.FLAVOR + "/config.yml"
].concat(flavorJsFiles);

var baseViewPaths = glob.sync(path.resolve(__dirname, 'src/base/static/js/views/*.js'));
var alias = {};

for (var i = 0; i < baseViewPaths.length; i++) {
  var baseViewPath = baseViewPaths[i];
  var viewName = baseViewPath.match(/\/([^\/]*)\.js$/)[1];
  var aliasName = 'mapseed-' + viewName + '$';
  var flavorViewPath = path.resolve(__dirname, 'src/flavors', process.env.FLAVOR, 'static/js/views/', viewName + '.js');
  if (fs.existsSync(flavorViewPath)) {
    alias[aliasName] = flavorViewPath;
  } else {
    alias[aliasName] = baseViewPath;
  }
}

var outputBasePath = path.resolve(__dirname, "www");
const extractSCSS = new ExtractTextPlugin((process.env.NODE_ENV === "production") ? "[contenthash].bundle.css" : "bundle.css");
const extractYML = new ExtractTextPlugin("config-en_US.js");

module.exports = {
  entry: entryPoints,
  output: {
    path: path.join(outputBasePath, "dist"),
    filename: (process.env.NODE_ENV === "production") ? "[chunkhash].bundle.js" : "bundle.js"
  },
  resolve: {
    alias: alias
  },
  resolveLoader: {
    modules: ["node_modules", path.resolve(__dirname, "scripts")]
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        loader: extractSCSS.extract({
          fallback: "style-loader",
          use: "css-loader?url=false!sass-loader?includePaths[]=" + path.resolve(__dirname, "./node_modules/compass-mixins/lib")
        }),
      },
      {
        test: /config\.yml$/,
        use: [
          "json-loader",
          "config-loader",
          "json-loader",
          "yaml-loader"
        ]
      },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  plugins: [
    extractSCSS,
    new CompressionPlugin({
      asset: "[path].gz[query]"
    }),
    extractYML,
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ],
  devServer: {
    contentBase: outputBasePath,
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [
        // Handle requests when the site is loaded with a path other than the
        // root.
        // {
        //   from: /^.*(?!html)$/,
        //   to: "/index.html"
        // }
      ]
    },
    compress: true,
    port: PORT
  }
};