require('dotenv').config({path: 'src/.env'});
var path = require('path');
var glob = require('glob');
var fs = require('fs');
require("babel-polyfill")

var flavorJsFiles = glob.sync("./src/flavors/" + process.env.FLAVOR + "/static/js/*.js");
var entryPoints = ["babel-polyfill", "./src/base/static/js/routes.js", "./src/base/static/js/handlebars-helpers.js"].concat(flavorJsFiles);

var baseViewPaths = glob.sync(path.resolve(__dirname, 'src/base/static/js/views/*.js'));
var alias = {};

for (var i = 0; i < baseViewPaths.length; i++) {
  var baseViewPath = baseViewPaths[i];
  var viewName = baseViewPath.match(/\/([^\/]*)\.js$/)[1];
  var aliasName = 'mapseed-' + viewName + '$';
  var flavorViewPath = path.resolve(__dirname, 'src/flavors/' + process.env.FLAVOR + '/static/js/views/' + viewName + '.js');
  if (fs.existsSync(flavorViewPath)) {
    alias[aliasName] = flavorViewPath;
  } else {
    alias[aliasName] = baseViewPath;
  }
}

module.exports = {
  entry: entryPoints,
  output: {
    path: "./src/base/static/dist/",
    filename: "bundle.js"
  },
  resolve: {
    alias: alias
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
};
