const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const webpack = require("webpack");

require("dotenv").config({ path: "src/.env" });
require("babel-polyfill");
var path = require("path");
var glob = require("glob");
var fs = require("fs");
const shell = require("shelljs");

const PORT = 8000;

if (!process.env.FLAVOR) {
  process.exitCode = 1;
  process.exit();
}

const distPath = path.resolve(__dirname, "www/dist");

// clean out the output directory and recreate it
shell.rm("-rf", distPath);
shell.mkdir("-p", distPath);

var flavorJsFiles = glob.sync(
  "./src/flavors/" + process.env.FLAVOR + "/static/js/*.js",
);
var entryPoints = [
  "babel-polyfill",
  "./src/base/static/js/routes.js",
  "./src/base/static/js/handlebars-helpers.js",
  "./src/base/static/scss/default.scss",
  "./src/base/static/css/leaflet.draw.css",
  "./src/base/static/css/leaflet-sidebar.css",
  "./src/flavors/" + process.env.FLAVOR + "/static/css/custom.css",
  "./src/flavors/" + process.env.FLAVOR + "/config.yml",
].concat(flavorJsFiles);

var baseViewPaths = glob.sync(
  path.resolve(__dirname, "src/base/static/js/views/*.js"),
);
var alias = {};

for (var i = 0; i < baseViewPaths.length; i++) {
  var baseViewPath = baseViewPaths[i];
  var viewName = baseViewPath.match(/\/([^\/]*)\.js$/)[1];
  var aliasName = "mapseed-" + viewName + "$";
  var flavorViewPath = path.resolve(
    __dirname,
    "src/flavors",
    process.env.FLAVOR,
    "static/js/views/",
    viewName + ".js",
  );
  if (fs.existsSync(flavorViewPath)) {
    alias[aliasName] = flavorViewPath;
  } else {
    alias[aliasName] = baseViewPath;
  }
}

alias.config = path.resolve(
  __dirname,
  "src/flavors",
  process.env.FLAVOR,
  "config.yml",
);

var outputBasePath = path.resolve(__dirname, "www");
const extractSCSS = new ExtractTextPlugin(
  process.env.NODE_ENV === "production"
    ? "[contenthash].bundle.css"
    : "bundle.css",
);
const theme = process.env.THEME ? process.env.THEME : "default-theme";

module.exports = {
  entry: entryPoints,
  output: {
    path: path.join(outputBasePath, "dist"),
    filename:
      process.env.NODE_ENV === "production"
        ? "[chunkhash].bundle.js"
        : "bundle.js",
  },
  resolve: {
    alias: alias,
  },
  resolveLoader: {
    modules: ["node_modules", path.resolve(__dirname, "scripts")],
  },
  module: {
    rules: [
      {
        test: /locales/,
        loader: "i18next-resource-store-loader",
        query: {
          include: /\.json$/,
        },
      },
      {
        test: /\.s?css$/,
        use: extractSCSS.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader?url=false",
            },
            {
              loader: "sass-loader",
              options: {
                includePaths: [
                  path.resolve(
                    __dirname,
                    "./node_modules/react-datepicker/dist",
                  ),
                  path.resolve(__dirname, "./node_modules/compass-mixins/lib"),
                  path.resolve(__dirname, "./src/base/static/stylesheets/util"),
                  path.resolve(
                    __dirname,
                    "./src/base/static/stylesheets/themes",
                    theme,
                  ),
                ],
              },
            },
          ],
        }),
      },
      {
        test: /config\.yml$/,
        use: ["json-loader", "config-loader", "json-loader", "yaml-loader"],
      },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV":
        process.env.NODE_ENV === "production"
          ? JSON.stringify("production")
          : JSON.stringify("dev"),
      MAP_PROVIDER_TOKEN: JSON.stringify(process.env.MAP_PROVIDER_TOKEN),
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    extractSCSS,
    new CompressionPlugin({
      asset: "[path].gz[query]",
    }),
  ],
  devtool:
    process.env.NODE_ENV === "production" ? false : "cheap-eval-souce-map",
  devServer: {
    contentBase: outputBasePath,
    historyApiFallback: {
      disableDotRule: true,
    },
    compress: true,
    port: PORT,
  },
};
