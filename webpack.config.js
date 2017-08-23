require('dotenv').config({path: 'src/.env'});
require("babel-polyfill");
var path = require('path');
var glob = require('glob');
var fs = require('fs');
var copy = require('recursive-copy');
var yaml = require('js-yaml');
var Gettext = require("node-gettext");
var gettextParser = require("gettext-parser");
var walk = require("object-walk"); // object-walk supports traversal of JS objects
var Handlebars = require("handlebars");
var wax = require("wax-on"); // wax-on adds template inheritance to Handlebars
var execSync = require("child_process").execSync;

var flavorJsFiles = glob.sync("./src/flavors/" + process.env.FLAVOR + "/static/js/*.js");
var entryPoints = [
  "babel-polyfill",
  "./src/base/static/js/routes.js",
  "./src/base/static/js/handlebars-helpers.js"
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


// =============================================================================
// BEGIN STATIC SITE BUILD
//
// Overview:
// (1) Configure paths, variables, and utilities
// (2) Set up Handlebars helpers and resolve template inheritances
// (3) Convert config yaml to JSON object
// (4) Compile base Handlebars templates
// (5) Localize config and jstemplates, and build index file
// (6) Copy static assets to the dist/ folder
//
//
// NOTES
//   - This build still depends on a .env file with dataset urls
//
// TODOS
//   - Asynchronous processing!
//   - Replace Django template filters with Handlebars helpers
//   - jstemplates/ flavor override behavior
//   - pages templates handling
//   - A dev build option that skips all localization, to save time
//   - In development, use gulp to watch changes to classes of files, and build
//     components (jstemplates, config blob, etc.) separately as needed. Only
//     build the final index files for production.
// =============================================================================


// (1) Set up paths to files and directories needed for the build, as well as
// constants and utilities
// -----------------------------------------------------------------------------

const VERBOSE = true; // Controls logging output
const PORT = 8000;

var flavorBasePath = path.resolve(
  __dirname,
  "src/flavors",
  process.env.FLAVOR
);
var flavorConfigPath = path.resolve(
  flavorBasePath,
  "config.yml"
);
var baseImageAssetsPath = path.resolve(
  __dirname,
  "src/base/static/css/images"
);
var flavorImageAssetsPath = path.resolve(
  flavorBasePath,
  "static/css/images"
);
var localeDir = path.resolve(
  flavorBasePath,
  "locale"
);
var baseJSTemplatesPath = path.resolve(
  __dirname,
  "src/base/jstemplates"
);
var flavorJSTemplatesPath = path.resolve(
  flavorBasePath,
  "jstemplates"
);
var handlebarsExec = path.resolve(
  __dirname,
  "node_modules/handlebars/bin/handlebars"
);

var outputBasePath = path.resolve(__dirname, "www")
var compiledTemplatesOutputPath = path.resolve(outputBasePath, "templates.js");
var outputImageAssetsPath = path.resolve(outputBasePath, "css/images");

const PO_FILE_NAME = "django.po"; // Assumes all flavors will have a .po file
                                  // matching this name
const GETTEXT_REGEX = /^_\(/;     // Use this to parse config gettext strings of
                                  // the form _(xyz xyz) when we traverse the
                                  // config
const BASE_STATIC_URL = "/static/";
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

// TODO: add this to .env
const CLICKY_ANALYTICS_ID = process.env.CLICKY_ANALYTICS_ID || "";

// TODO: add this to .env
const MAPQUEST_KEY = process.env.MAPQUEST_KEY || "";

// TODO: add this to .env
const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || "";

// Pull out dataset urls from the .env file. We ignore the keys, as they're no
// longer needed.
var datasetSiteUrls = {};
Object.keys(process.env).forEach(function(key) {
  if (key.endsWith("_SITE_URL")) {
    datasetSiteUrls[key] = process.env[key];
  }
});

// Logging
var log = function(msg, time) {
  if (VERBOSE) {
    console.log(
      "(STATIC SITE BUILD) ",
      msg,
      (
        (time)
          ? "in " + time + " ms"
          : ""
      )
    );
  }
};

// Synchronous timing
var time = function(fn) {
  var start = new Date().getTime();
  fn();
  var end = new Date().getTime();

  return end - start;
};

// Gettext object
var gt = new Gettext();


// (2) Register Handlebars helpers and resolve template inheritances
// -----------------------------------------------------------------------------

// Helper for serializing config objects and injecting them into the index.html
// file
Handlebars.registerHelper("serialize", function(json) {
  if (!json) return false;
  return JSON.stringify(json);
});

// Gettext helper
Handlebars.registerHelper("_", function(msg) {
  return gt.gettext(msg);
});

// Helper for injecting precompiled templates to the index.html file
Handlebars.registerHelper("precompile_jstemplates", function() {
  return fs.readFileSync(compiledTemplatesOutputPath);
});

// Set up template inheritance resolving
wax.on(Handlebars);
wax.setLayoutPath(path.resolve(flavorBasePath, "templates"));


// (3) Convert the config yaml to json
// -----------------------------------------------------------------------------

var config;
var d = time(
  () => {
    config = yaml.safeLoad(fs.readFileSync(flavorConfigPath));
  }
);
log("Finished YAML parse", d);


// (4) Compile base.hbs and index.html templates for the current flavor
// -----------------------------------------------------------------------------

var source, template;
var d = time(
  () => {
    source = fs.readFileSync(
      path.resolve(
        flavorBasePath,
        "templates/index.html"
      ),
      "utf8"
    );
    template = Handlebars.compile(source);
  }
);

// Override flavor jstemplates
copy(
  path.resolve(
    flavorBasePath,
    "static/css/custom.css"
  ),
  path.resolve(outputBasePath, "css/custom.css"),
  { overwrite: true }
);


// (5) Localize the config for each language for the current flavor, precompile
//     localized jstemplates Handlebars templates, and inject all localized
//     content into the index-xx.html file
// -----------------------------------------------------------------------------

fs.readdirSync(localeDir).forEach((langDir) => {

  // Quick and dirty config clone
  var thisConfig =  JSON.parse(JSON.stringify(config));

  // Localize the config for the current language
  var input = fs.readFileSync(
    path.resolve(
      localeDir,
      langDir,
      "LC_MESSAGES",
      PO_FILE_NAME
    )
  );
  var po = gettextParser.po.parse(input);
  gt.addTranslations(langDir, "messages", po);
  gt.setTextDomain("messages");
  gt.setLocale(langDir);

  var d = time(
    () => {
      walk(thisConfig, (val, prop, obj) => {
        if (typeof val === "string") {
          if (GETTEXT_REGEX.test(val)) {
            val = val
              .replace(GETTEXT_REGEX, "")
              .replace(/\)$/, "");
          }

          obj[prop] = gt.gettext(val);
        }
      });
    }
  );
  log("Finished localizing config for " + langDir, d);

  // Add dataset site urls
  thisConfig["datasets"] = datasetSiteUrls;

  // Precompile (and localize) Handlebars jstemplates
  var d = time(
    () => {
      execSync(
        handlebarsExec +
        " -e 'html' -m " + baseJSTemplatesPath +
        " -f " + compiledTemplatesOutputPath
      );
    }
  );
  log("Finished jstemplates compilation for " + langDir, d);

  // Build the index.html file for this language
  var result = template({
    config: thisConfig,
    settings: {
      MAPBOX_TOKEN: MAPBOX_TOKEN,
      CLICKY_ANALYTICS_ID: CLICKY_ANALYTICS_ID,
      MAPQUEST_KEY: MAPBOX_TOKEN,
      GOOGLE_ANALYTICS_ID: GOOGLE_ANALYTICS_ID,
    },
    LANGUAGE_CODE: langDir,

    // TODO: what are we going to do about session management?
    user_token_json: "",

    // TODO: user agent identification needs to be moved client-side
    user_agent_json: {
      browser: {
        name: "some browser name"
      }
    }
  });

  // Write out final index.html file
  var filename = path.resolve(
    outputBasePath,
    (langDir == 'en_US' ? 'index' : langDir) + ".html"
  );
  fs.writeFileSync(filename, result);
});


// (6) Move static image assets to the dist/ folder. Copy base project assets
//     first, then copy flavor images, overriding base assets as needed
// -----------------------------------------------------------------------------

// Copy base project static image assets to www/images
copy(
  baseImageAssetsPath,
  outputImageAssetsPath,
  { overwrite: true }
);

// Copy flavor static image assets to www/images, replacing
// base assets as necessary
copy(
  flavorImageAssetsPath,
  outputImageAssetsPath,
  { overwrite: true }
);

// Copy flavor custom.css
copy(
  path.resolve(
    flavorBasePath,
    "static/css/custom.css"
  ),
  path.resolve(
    outputBasePath,
    "custom.css"
  ),
  { overwrite: true }
);

copy(
  path.resolve(
    __dirname, "src/base/static/libs"
  ),
  path.resolve(
    outputBasePath, "libs"
  ),
  {overwrite: true}
);


// =============================================================================
// END STATIC SITE BUILD
// =============================================================================


module.exports = {
  entry: entryPoints,
  output: {
    path: path.join(outputBasePath, "dist"),
    filename: "bundle.js"
  },
  resolve: {
    alias: alias
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  devServer: {
    contentBase: outputBasePath,
    historyApiFallback: {
      rewrites: [
        // Handle requests when the site is loaded with a path other than the
        // root.
        {
          from: /libs\/.*\.js$/,
          to: function(context) {
            return context.match[0];
          }
        },
        {
          from: /^.*$/,
          to: "/index.html"
        }
      ]
    },
    compress: true,
    port: PORT
  }
};
