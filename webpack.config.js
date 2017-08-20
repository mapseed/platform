require('dotenv').config({path: 'src/.env'});
require("babel-polyfill");
var path = require('path');
var glob = require('glob');
var fs = require('fs-extra');
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
// (5a) Resolve jstemplates flavor overrides and handle pages/ templates
// (6) Copy static assets to the dist/ folder
//
//
// NOTES 
//   - This build still depends on a .env file with dataset urls
//
// TODOS
//   - Asynchronous processing!
//   - Replace Django template filters with Handlebars helpers
//   - A dev build option that skips all localization, to save time
//   - In development, use gulp to watch changes to classes of files, and build
//     components (jstemplates, config blob, etc.) separately as needed. Only
//     build the final index files for production.
//   - Some fonts not being resolved correctly? FA seems broken...
//   - Include base project .po files
// =============================================================================


// (1) Set up paths to files and directories needed for the build, as well as
//     constants and utilities
// -----------------------------------------------------------------------------

const VERBOSE = true; // Controls logging output
const PORT = 8000;

// Flavor base
var flavorBasePath = path.resolve(
  __dirname, 
  "src/flavors",
  process.env.FLAVOR
);
var flavorConfigPath = path.resolve(
  flavorBasePath,
  "config.yml"
);

// Handlebars templates
var baseJSTemplatesPath = path.resolve(
  __dirname,
  "src/base/jstemplates"
);
var flavorJSTemplatesPath = path.resolve(
  flavorBasePath,
  "jstemplates"
);
var flavorPagesPath = path.resolve(  // NOTE: pages are a flavor-only concept,
                                     // so there's no basePagesPath
  flavorBasePath,
  "jstemplates/pages"
);
var outputJSTemplatesPath = path.resolve(
  __dirname,
  "src/base/static/dist/jstemplates"
);
var compiledTemplatesOutputPath = path.resolve(
  __dirname,
  "src/base/jstemplates/templates.js" // TODO: is this the right place for this?
);

// Handlebars executable
var handlebarsExec = path.resolve(
  __dirname,
  "node_modules/handlebars/bin/handlebars"
);

// Images and markers
var baseImageAssetsPath = path.resolve(
  __dirname,
  "src/base/static/css/images"
);
var flavorImageAssetsPath = path.resolve(
  flavorBasePath,
  "static/css/images"
);
var outputImageAssetsPath = path.resolve(
  __dirname,
  "src/base/static/dist/images"
);

// Localization
var baseLocaleDir = path.resolve(
  __dirname,
  "src/base/locale"
);
var flavorLocaleDir = path.resolve(
  flavorBasePath,
  "locale"
);

const PO_FILE_NAME = "django.po";     // Assumes all flavors will have a .po 
                                      // file matching this name
const CONFIG_GETTEXT_REGEX = /^_\(/;
const JSTEMPLATES_GETTEXT_REGEX = /{{#_}}(.*?){{\/_}}/g;
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

// Timing
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

// Helper for injecting precompiled templates to the index.html file
var compiledTemplatesOutputPath;
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


// (5) Localize the config for each language for the current flavor, precompile
//     localized jstemplates Handlebars templates, and inject all localized
//     content into the index-xx.html file
// -----------------------------------------------------------------------------

fs.readdirSync(flavorLocaleDir).forEach((langDir) => {

  // Quick and dirty config clone
  var thisConfig =  JSON.parse(JSON.stringify(config));

  // Localize the config for the current language
  // TODO: catenate flavor .po with base project .po!
  var input = fs.readFileSync(
    path.resolve(
      flavorLocaleDir, 
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
          if (CONFIG_GETTEXT_REGEX.test(val)) {
            val = val
              .replace(CONFIG_GETTEXT_REGEX, "")
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


  // (5a) Copy all jstemplates and flavor pages to a working directory from 
  //      which the templates can be localized and precompiled. Also resolve 
  //      flavor jstemplates overrides at this step
  // ---------------------------------------------------------------------------

  var d = time(
    () => {
      fs.copySync(
        baseJSTemplatesPath,
        outputJSTemplatesPath
      );

      fs.copySync(
        flavorJSTemplatesPath,
        outputJSTemplatesPath
      );

      fs.copySync(
        flavorPagesPath,
        outputJSTemplatesPath
      );
    }
  );
  log("Finished copying jstemplates assets", d);

  // Localize jstemplates
  fs.readdirSync(outputJSTemplatesPath).forEach((template) => {
    if (template.endsWith("html")) {
      var templ = path.resolve(outputJSTemplatesPath, template);
      var result = fs.readFileSync(
        templ,
        "utf8"
      ).replace(
        JSTEMPLATES_GETTEXT_REGEX,
        gt.gettext("$1")
      );

      fs.writeFileSync(
        templ,
        result,
        "utf8"
      );
    }
  });

  // Precompile jstemplates and pages Handlebars templates
  var d = time(
    () => {
      execSync(
        handlebarsExec + 
        " -m -e 'html' " + outputJSTemplatesPath + 
        " -f " + compiledTemplatesOutputPath
      );
    }
  );
  log("Finished jstemplates compilation for " + langDir, d);

  // Build the index-xx.html file for this language
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
    flavorBasePath, 
    "templates", 
    "index-" + langDir + ".html"
  );
  fs.writeFileSync(filename, result);
});


// (6) Move static image assets to the dist/ folder. Copy base project assets
//     first, then copy flavor assets, overriding base assets as needed
// -----------------------------------------------------------------------------

// Copy base project static image assets to src/base/static/dist/images 
fs.copySync(
  baseImageAssetsPath, 
  outputImageAssetsPath
);

// Copy flavor static image assets to src/base/static/dist/images, replacing
// base assets as necessary
fs.copySync(
  flavorImageAssetsPath, 
  outputImageAssetsPath
);

// Copy flavor custom.css
fs.copySync(
  path.resolve(
    flavorBasePath, 
    "static/css/custom.css"
  ), 
  path.resolve(
    __dirname, 
    "src/base/static/dist/custom.css"
  )
);

// TEMPORARY: copy the English version of the index file (index-en_US.html) 
// to the dist/ folder and rename it to index.html.
// TODO: handle language switching
fs.copySync(
  path.resolve(
    flavorBasePath, 
    "templates/index-es.html"
  ), 
  path.resolve(
    __dirname, 
    "src/base/static/index.html"
  )
);

// =============================================================================
// END STATIC SITE BUILD
// =============================================================================


module.exports = {
  entry: entryPoints,
  output: {
    path: path.join(__dirname, "src/base/static/dist/"),
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
    contentBase: path.join(__dirname, "src/base/static"),
    historyApiFallback: {
      rewrites: [
        // Handle requests when the site is loaded with a path other than the
        // root. 
        {
          from: /custom\.css/,
          to: "/dist/custom.css"
        },
        {
          from: /bundle\.css/,
          to: "/dist/bundle.css"
        },
        {
          from: /bundle\.js/,
          to: "/dist/bundle.js"
        },
        { 
          from: /libs\/.*\.js$/,
          to: function(context) {
            return context.match[0];
          }
        },
        {
          from: /\/images\/.*$/,
          to: function(context) {
            return "dist" + context.match[0];
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
