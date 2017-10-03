const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

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
var mv = require("mv");


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

if (process.env.NODE_ENV !== 'production') {
  shell.mkdir('-p', 'www/dist');

  shell.cat([
    'src/base/static/css/leaflet-sidebar.css',
    'src/base/static/css/leaflet.draw.css',
    'src/base/static/css/spectrum.css',
    'src/base/static/css/quill.snow.css',
    'src/base/static/css/default.css',
    'src/base/static/css/jquery.datetimepicker.css',
    'src/flavors/' + process.env.FLAVOR + '/static/css/custom.css'
  ]).to('www/dist/bundle.css');
}

// =============================================================================
// BEGIN STATIC SITE BUILD
//
// Overview:
// (1) Configure paths, variables, and utilities
// (2) Set up Handlebars helpers and resolve template inheritances
// (3) Convert config yaml to JSON object
// (4) Compile base Handlebars templates
// (5) Resolve jstemplates flavor overrides and handles pages/ templates
// (6) Localize config and jstemplates, and build index file
// (7) Copy static assets to the dist/ folder
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
//   - Error checking on fs.readFileSync calls
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
var indexFilesPath = path.resolve(
  flavorBasePath,
  "templates"
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

var outputBasePath = path.resolve(__dirname, "www");
var compiledTemplatesOutputPath = path.resolve(outputBasePath, "templates.js");
var outputImageAssetsPath = path.resolve(outputBasePath, "static/css/images");

// Images and markers
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
var mergedPOFileOutputPath = path.resolve(
  __dirname,
  "src/base/static/dist/django.po"
)

const PO_FILE_NAME = "django.po";     // Assumes all flavors will have a .po 
                                      // file matching this name
const CONFIG_GETTEXT_REGEX = /^_\(/;

// NOTE: We use [\s\S] here instead of . so we can match newlines.
const JSTEMPLATES_GETTEXT_REGEX = /{{#_}}([\s\S]*?){{\/_}}/g;
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
  if (key.endsWith("SITE_URL")) {
    datasetSiteUrls[key] = process.env[key];
  }
});

// Logging
var log = function(msg) {
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

var source = fs.readFileSync(
  path.resolve(
    flavorBasePath, 
    "templates/index.html"
  ), 
  "utf8"
);
var template = Handlebars.compile(source);


// (5) Copy all jstemplates and flavor pages to a working directory from which 
//     the templates can be localized and precompiled. Also resolve flavor 
//     jstemplates overrides at this step
// -----------------------------------------------------------------------------

var d = time(
  () => {
    source = fs.readFileSync(
      path.resolve(
        flavorBasePath,
        "templates/index.html"
      ),
      "utf8"
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
log("Finished copying jstemplates assets", d);


// (6) Localize the config for each language for the current flavor, precompile
//     localized jstemplates Handlebars templates, and inject all localized
//     content into the index-xx.html file
// -----------------------------------------------------------------------------

fs.readdirSync(flavorLocaleDir)
  .filter((item) => {

    // Filter out hidden files in the locale directory (like .DS_Store on OSX)
    return !(/(^|\/)\.[^\/\.]/g).test(item);
  })
  .forEach((langDir) => {

  // Quick and dirty config clone
  var thisConfig =  JSON.parse(JSON.stringify(config));
  var flavorPOPath = path.resolve(
    flavorLocaleDir,
    langDir,
    "LC_MESSAGES",
    PO_FILE_NAME
  );

  // Merge the current language .po with the base project .po of the same
  // language, if it exists.
  var input;
  try {
    execSync(
      "msgcat" + // NOTE: msgcat is a gettext command line program that merges
                 // two .po files.
      " --no-location " +
      " -o " + mergedPOFileOutputPath + " " +
      flavorPOPath + " " +
      path.resolve(
        baseLocaleDir,
        langDir,
        "LC_MESSAGES",
        PO_FILE_NAME
      )
    );
    input = fs.readFileSync(mergedPOFileOutputPath);
    log("Finsihed merging .po file for " + langDir);
  } catch(e) {
    log("Skipping .po file merge for " + langDir + ": no base .po file found");
    input = fs.readFileSync(flavorPOPath);
  }

  var po = gettextParser.po.parse(input);
  gt.addTranslations(langDir, "messages", po);
  gt.setTextDomain("messages");
  gt.setLocale(langDir);

  // Localize the config for the current language.
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
  log("Finished localizing config for " + langDir);

  // Add dataset site urls
  thisConfig["datasets"] = datasetSiteUrls;


  // (5a) Copy all jstemplates and flavor pages to a working directory from 
  //      which the templates can be localized and precompiled. Also resolve 
  //      flavor jstemplates overrides at this step
  // ---------------------------------------------------------------------------

  try {
    fs.copySync(
      baseJSTemplatesPath,
      outputJSTemplatesPath
    );
  } catch (e) {
    log("(ERROR!) Error copying base jstemplates assets: " + e);
  }

  try {
    fs.copySync(
      flavorJSTemplatesPath,
      outputJSTemplatesPath
    );
  } catch (e) {
    log("(ERROR!) Error copying flavor jstemplates assets: " + e);
  }

  try {
    fs.copySync(
      flavorPagesPath,
      outputJSTemplatesPath
    );
  } catch (e) {
    log("(ERROR!) Error copying flavor pages assets: " + e);
  }

  log("Finished copying jstemplates assets");

  // Localize jstemplates
  fs.readdirSync(outputJSTemplatesPath).forEach((template) => {
    if (template.endsWith("html")) {
      var templ = path.resolve(outputJSTemplatesPath, template);
      var result = fs.readFileSync(
        templ,
        "utf8"
      ).replace(
        JSTEMPLATES_GETTEXT_REGEX,
        (match, capture) => {
          return gt.gettext(capture);
        }
      );

      fs.writeFileSync(
        templ,
        result,
        "utf8"
      );
    }
  });

  // Precompile jstemplates and pages Handlebars templates
  execSync(
    handlebarsExec + 
    " -m -e 'html' " + outputJSTemplatesPath + 
    " -f " + compiledTemplatesOutputPath +
    // List known template helpers. This is a precompilation optimization.
    " -k current_url" +
    " -k permalink" +
    " -k is" +
    " -k is_not" +
    " -k if_fileinput_not_supported" +
    " -k if_not_authenticated" +
    " -k property" +
    " -k is_authenticated" +
    " -k current_user" +
    " -k formatdatetime" +
    " -k fromnow" +
    " -k truncatechars" +
    " -k is_submitter_name" +
    " -k action_text" +
    " -k place_type_label" +
    " -k survey_label_by_count" +
    " -k survey_label" +
    " -k survey_label_plural" +
    " -k support_label" +
    " -k support_label_plural" +
    " -k survey_count" +
    " -k get_value" +
    " -k select_item_value" +
    " -k contains" +
    " -k place_url" +
    " -k windowLocation" +
    " -k nlToBr" +
    " -k formatDateTime" +
    " -k fromNow" +
    " -k times" +
    " -k range" +
    " -k select" +
    " -k ifAnd"
  );
  log("Finished jstemplates compilation for " + langDir);

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
    outputBasePath,
    (langDir == 'en_US' ? 'index' : langDir.toLowerCase().replace("_", "-")) + ".html"
  );
  fs.writeFileSync(filename, result);
});


// (7) Move static image assets to the dist/ folder. Copy base project assets
//     first, then copy flavor assets, overriding base assets as needed
// -----------------------------------------------------------------------------

// Copy base project static image assets to src/base/static/dist/images 
try {
  fs.copySync(
    baseImageAssetsPath, 
    outputImageAssetsPath
  );
} catch (e) {
  log("(ERROR!) Error copying base image assets: " + e);
}

// Copy flavor static image assets to www/images, replacing
// base assets as necessary
try {
  fs.copySync(
    flavorImageAssetsPath, 
    outputImageAssetsPath
  );
} catch (e) {
  log("(ERROR!) Error copying flavor image assets: " + e);
}

// Copy flavor custom.css
try {
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
} catch (e) {
  log("(ERROR!) Error copying flavor custom.css: " + e);
}


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
