/* eslint-disable @typescript-eslint/no-var-requires */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs-extra");
const path = require("path");
const configPreprocessor = require("./scripts/config-preprocessor");

require("dotenv").config({ path: "src/.env" });

const PORT = 8000;
const flavor = process.env.FLAVOR;

const config = configPreprocessor(
  JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "src/flavors", process.env.FLAVOR, "config.json"),
    ),
  ),
  "utf8",
);

if (!flavor) {
  process.exitCode = 1;
  process.exit();

  console.error("Please set the FLAVOR environment variable.");
}

const isProd = process.env.NODE_ENV === "production";
const outputPath = path.resolve(__dirname, "www");
const gitSha = require("child_process")
  .execSync("git rev-parse HEAD")
  .toString();

var entryPoints = [
  "@babel/polyfill",
  "whatwg-fetch",
  "normalize.css",
  "./src/base/static/index.tsx",
  "./src/flavors/" + flavor + "/static/css/custom.css",
];

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
    // Support dynamic imports from nested routes.
    // See: https://github.com/webpack/webpack/issues/7417
    publicPath: "/",
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      cacheGroups: {
        reactReduxVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom|redux|react-redux)[\\/]/,
          name: "reactReduxVendor",
        },
        reactUtilityVendor: {
          test: /[\\/]node_modules[\\/](react-draggable|react-i18next|react-modal|react-quill|react-router-dom|react-virtualized)[\\/]/,
          name: "reactUtilityVendor",
        },
        mapVendor: {
          test: /[\\/]node_modules[\\/](react-map-gl)[\\/]/,
          name: "mapVendor",
        },
        utilityVendor: {
          test: /[\\/]node_modules[\\/](moment|moment-timezone)[\\/]/,
          name: "utilityVendor",
        },
        vendor: {
          test: /[\\/]node_modules[\\/](!moment)(!moment-timezone)(!react)(!react-dom)(!redux)(!react-redux)(!react-map-gl)(!react-draggable)(!react-i18next)(!react-quill)(!react-router-dom)(!react-virtualized)[\\/]/,
          name: "vendor",
        },
      },
    },
  },
  resolve: {
    alias: {
      // alias for our config:
      config: path.resolve(__dirname, "src/flavors", flavor, "config.json"),
    },
    extensions: [".wasm", ".mjs", ".js", ".json", ".ts", ".tsx"],
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
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            // This is a feature of `babel-loader` for webpack (not Babel itself).
            // It enables caching results in ./node_modules/.cache/babel-loader/
            // directory for faster rebuilds.
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: [
          {
            loader: "source-map-loader",
          },
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
    ],
  },
  node: {
    fs: "empty",
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new webpack.DefinePlugin({
      NODE_ENV: isProd ? JSON.stringify("production") : JSON.stringify("dev"),
      MAP_PROVIDER_TOKEN: JSON.stringify(process.env.MAP_PROVIDER_TOKEN),
      PUBLIC_URL: JSON.stringify(`https://${process.env.DEPLOY_DOMAIN}`),
      API_ROOT: JSON.stringify(config.app.api_root),
      FLAVOR: JSON.stringify(flavor),
      GIT_SHA: JSON.stringify(gitSha),
      MIXPANEL_TOKEN: JSON.stringify(process.env.MIXPANEL_TOKEN),
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    extractSCSS,
    new WorkboxPlugin.InjectManifest({
      swSrc: path.join("src", "sw.js"),
      swDest: path.join(outputPath, "service-worker.js"),
    }),
    new HtmlWebpackPlugin({
      template:
        "!!handlebars-loader!" +
        path.join(__dirname, "src/base/templates/base.hbs"),
      templateParameters: {
        flavor: process.env.FLAVOR,
        googleAnalyticsId:
          isProd && process.env[flavor.toUpperCase() + "_GOOGLE_ANALYTICS_ID"],
        googleAnalyticsDomain:
          isProd && (process.env.GOOGLE_ANALYTICS_DOMAIN || "auto"),
        config,
      },
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
