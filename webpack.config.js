const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const webpack = require("webpack");
const shell = require("shelljs");

require("dotenv").config({ path: "src/.env" });
require("babel-polyfill");
var path = require("path");
var glob = require("glob");
var fs = require("fs");

const PORT = 8000;

if (!process.env.FLAVOR) {
  process.exitCode = 1;
  process.exit();
}

if (process.env.NODE_ENV === "production") {
  // If we're building for production, webpack runs before
  // scripts/static-build.js, so make sure the output directory is cleaned out.
  const outputBasePath = path.resolve(__dirname, "www");
  shell.rm("-rf", outputBasePath);
  shell.mkdir("-p", path.resolve(outputBasePath, "dist"));
}

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
    // https://github.com/mapbox/mapbox-gl-js/issues/4359#issuecomment-28800193
    noParse: /(mapbox-gl)\.js$/,
    rules: [
      {
        test: /\.modernizrrc\.js$/,
        loader: "webpack-modernizr-loader",
      },
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
    allowedHosts: [".ngrok.io"],
  },
};
