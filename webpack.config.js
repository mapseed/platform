const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

require('dotenv').config({path: 'src/.env'});
require("babel-polyfill");
var path = require('path');
var glob = require('glob');
var fs = require('fs');

const PORT = 8000;

if (!process.env.FLAVOR) {
  process.exitCode = 1;
  process.exit();
}

var flavorJsFiles = glob.sync("./src/flavors/" + process.env.FLAVOR + "/static/js/*.js");
var entryPoints = [
  "babel-polyfill",
  "./src/base/static/js/routes.js",
  "./src/base/static/js/handlebars-helpers.js",
  "./src/base/static/scss/default.scss",
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
const extractSCSS = new ExtractTextPlugin("bundle.css");
const extractYML = new ExtractTextPlugin("config-en_US.js");

module.exports = {
  entry: entryPoints,
  output: {
    path: path.join(outputBasePath, "dist"),
    filename: "bundle.js"
  },
  resolve: {
    alias: alias
  },
  resolveLoader: {
    modules: ["node_modules", path.resolve(__dirname, "build-utils")]
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
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
      }
    ]
  },
  plugins: [
    extractSCSS,
    new CompressionPlugin({
      asset: "[path].gz[query]",
      test:  /\.css$/
    }),
    extractYML
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
