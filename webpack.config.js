const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const webpack = require("webpack");

require("dotenv").config({ path: "src/.env" });
require("@babel/polyfill");
var path = require("path");

const PORT = 8000;

if (!process.env.FLAVOR) {
  process.exitCode = 1;
  process.exit();
}

const isProd = process.env.NODE_ENV === "production";

const outputPath = path.resolve(__dirname, "www");

const gitSha = require("child_process")
  .execSync("git rev-parse HEAD")
  .toString();

var entryPoints = [
  "whatwg-fetch",
  "./src/base/static/js/routes.js",
  "./src/base/static/scss/default.scss",
  "./src/flavors/" + process.env.FLAVOR + "/static/css/custom.css",
];

let alias = {};
alias.config = path.resolve(
  __dirname,
  "src/flavors",
  process.env.FLAVOR,
  "config.json",
);

const extractSCSS = new MiniCssExtractPlugin({
  // Options similar to the same options in webpackOptions.output
  // both options are optional
  filename: isProd ? "[name].[hash].bundle.css" : "[name].bundle.css",
  chunkFilename: isProd ? "[id].[hash].bundle.css" : "[id].bundle.css",
});

module.exports = {
  mode: isProd ? "production" : "development",
  entry: entryPoints,
  output: {
    path: outputPath,
    // use this for our dynamic imports, like "1.bundle.js"
    chunkFilename: "[chunkhash].bundle.js",
    filename: isProd ? "[chunkhash].main.bundle.js" : "main.bundle.js",
  },
  resolve: {
    alias,
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
        use: [
          isProd ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader?url=false",
          {
            loader: "sass-loader",
            options: {
              includePaths: [
                path.resolve(__dirname, "./node_modules/compass-mixins/lib"),
                path.resolve(__dirname, "./src/base/static/stylesheets/util"),
                path.resolve(
                  __dirname,
                  "./src/base/static/stylesheets/themes",
                  "default-theme",
                ),
              ],
            },
          },
        ],
      },
      {
        test: /config\.json$/,
        use: ["config-loader", "json-loader"],
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader",
      },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
    ],
  },
  node: {
    fs: "empty",
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": isProd
        ? JSON.stringify("production")
        : JSON.stringify("dev"),
      MAP_PROVIDER_TOKEN: JSON.stringify(process.env.MAP_PROVIDER_TOKEN),
      GIT_SHA: JSON.stringify(gitSha),
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    extractSCSS,
    new CompressionPlugin({
      filename: "[path].gz[query]",
    }),
    new WorkboxPlugin.InjectManifest({
      swSrc: path.join("src", "sw.js"),
      swDest: path.join(outputPath, "service-worker.js"),
    }),
  ],
  devtool: isProd ? false : "cheap-eval-souce-map",
  devServer: {
    contentBase: outputPath,
    historyApiFallback: {
      disableDotRule: true,
    },
    compress: true,
    port: PORT,
    allowedHosts: [".ngrok.io"],
  },
};
