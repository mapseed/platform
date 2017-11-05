require('dotenv').config({path: 'src/.env'});
const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const Gettext = require("node-gettext");
const gettextParser = require("gettext-parser");
const walk = require("object-walk"); // object-walk supports traversal of JS objects
const Handlebars = require("handlebars");
const wax = require("wax-on"); // wax-on adds template inheritance to Handlebars
const execSync = require("child_process").execSync;
const mv = require("mv");
const shell = require('shelljs');
const glob = require('glob');
const colors = require('colors');

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
// TODOS
//   - Asynchronous processing!
// =============================================================================


// (1) Set up paths to certain files and directories needed for the build, as
//     well as utilities
// -----------------------------------------------------------------------------

// Control logging output
const verbose = true;

const outputBasePath = path.resolve(
  __dirname,
  "www"
);
const distPath = path.resolve(
  outputBasePath,
  "dist"
);

let jsHashedBundleName,
    cssHashedBundleName;
glob.sync(
  distPath +
  "/+(*.bundle.js|*.bundle.css)"
).forEach((path) => {
  path = path.split("/");
  if (path[path.length - 1].endsWith("js")) {
    jsHashedBundleName = path[path.length - 1] + ".gz";
  } else if (path[path.length - 1].endsWith("css")) {
    cssHashedBundleName = path[path.length - 1] + ".gz" ;
  }
});

// Logging
const log = (msg) => {
  if (verbose) {
    console.log("(STATIC SITE BUILD) ", colors.green("(SUCCESS) "), msg);
  }
};
const logError = (msg) => {
  console.error("(STATIC SITE BUILD) ", colors.red("(ERROR!) "), msg);
};

const flavor = process.env.FLAVOR;
if (!flavor) {
  logError("No flavor specified");
  logError("Please pass a flavor name using:");
  logError("FLAVOR=<flavor_name> npm start");
  logError("Aborting");

  process.exitCode = 1;
  process.exit();
}

// This version number is only used for cache-busting on our bundle.js
// and bundle.css files.
const bundleVersion = "0.7.5.9";

const flavorBasePath = path.resolve(
  __dirname,
  "src/flavors",
  flavor
);

// Pull out dataset urls from the .env file. We ignore the keys, as they're no
// longer needed.
let datasetSiteUrls = {};
Object.keys(process.env).forEach(function(key) {
  if (key.endsWith("SITE_URL")) {
    datasetSiteUrls[key] = process.env[key];
  }
});


// (2) Register Handlebars helpers and resolve template inheritances
// -----------------------------------------------------------------------------

// Helper for serializing config objects and injecting them into the index.html
// file
Handlebars.registerHelper("serialize", function(json) {
  if (!json) return false;
  return JSON.stringify(json);
});

// Helper for injecting precompiled templates to the index.html file
const compiledTemplatesOutputPath = path.resolve(
  outputBasePath,
  "templates.js"
);
Handlebars.registerHelper("precompile_jstemplates", function() {
  return fs.readFileSync(compiledTemplatesOutputPath);
});

// Set up template inheritance resolving
wax.on(Handlebars);
wax.setLayoutPath(path.resolve(flavorBasePath, "templates"));


// (3) Convert the config yaml to json
// -----------------------------------------------------------------------------

const flavorConfigPath = path.resolve(
  flavorBasePath,
  "config.yml"
);
const config = yaml.safeLoad(fs.readFileSync(flavorConfigPath));


// (4) Compile base.hbs and index.html templates for the current flavor
// -----------------------------------------------------------------------------

const source = fs.readFileSync(
  path.resolve(
    flavorBasePath,
    "templates/index.html"
  ),
  "utf8"
);
const indexTemplate = Handlebars.compile(source);


// (5) Localize the config for each language for the current flavor, precompile
//     localized jstemplates Handlebars templates, and inject all localized
//     content into the index-xx.html file
// -----------------------------------------------------------------------------

// Constants and variables to use inside the localization loop below
const handlebarsExec = path.resolve(
  __dirname,
  "node_modules/handlebars/bin/handlebars"
);
const baseJSTemplatesPath = path.resolve(
  __dirname,
  "src/base/jstemplates"
);
const flavorJSTemplatesPath = path.resolve(
  flavorBasePath,
  "jstemplates"
);
const flavorPagesPath = path.resolve(  // NOTE: pages are a flavor-only concept,
                                       // so there's no basePagesPath
  flavorBasePath,
  "jstemplates/pages"
);
const outputJSTemplatesPath = path.resolve(
  outputBasePath,
  "jstemplates"
);
const baseLocaleDir = path.resolve(
  __dirname,
  "src/base/locale"
);
const flavorLocaleDir = path.resolve(
  flavorBasePath,
  "locale"
);
const mergedPOFileOutputPath = path.resolve(
  outputBasePath,
  "messages.po"
);

let activeLanguages;
if (process.env.NODE_ENV == "production") {
  activeLanguages = (config.languages)
    ? config.languages
    : [{ code: "en_US" }];
} else {
  activeLanguages = [{ code: "en_US" }];
}

// NOTE: We use [\s\S] here instead of . so we can match newlines.
const jsTemplatesGettextRegex = /{{#_}}([\s\S]*?){{\/_}}/g;
const configGettextRegex = /^_\(/;

// Gettext object
const gt = new Gettext();
let thisConfig,
    flavorPOPath,
    mergedPOFile,
    rootComponents,
    protocol,
    outputIndexFilename;

// Loop over all languages defined in a given flavor's config file and
// generate fully localized output.
activeLanguages.forEach((language) => {

  // Quick and dirty config clone
  thisConfig =  JSON.parse(JSON.stringify(config));
  flavorPOPath = path.resolve(
    flavorLocaleDir,
    language.code,
    "LC_MESSAGES/messages.po"
  );

  // Merge the current language .po with the base project .po of the same
  // language, if it exists.
  try {
    execSync(
      "msgcat" + // NOTE: msgcat is a gettext command line program that merges
                 // two .po files.
      " --no-location " +
      " -o " + mergedPOFileOutputPath + " " +
      flavorPOPath + " " +
      path.resolve(
        baseLocaleDir,
        language.code,
        "LC_MESSAGES/messages.po"
      )
    );
    mergedPOFile = fs.readFileSync(mergedPOFileOutputPath);
    log("Finsihed merging .po file for " + language.code);
  } catch(e) {
    logError("Error merging .po file for " + language.code);
  }

  gt.addTranslations(
    language.code,
    "messages",
    gettextParser.po.parse(mergedPOFile)
  );
  gt.setTextDomain("messages");
  gt.setLocale(language.code);

  // Localize the config for the current language.
  walk(thisConfig, (val, prop, obj) => {
    if (typeof val === "string") {
      if (configGettextRegex.test(val)) {
        val = val
          .replace(configGettextRegex, "")
          .replace(/\)$/, "");
        obj[prop] = gt.gettext(val);
      }
    }
  });
  log("Finished localizing config for " + language.code);

  // Dataset urls are defined in the config. In most cases urls listed in the
  // config will be dev-api urls. If the .env defines a different dataset url
  // for a given dataset, use that value here.
  // Note that we retain the <DATASET>_SITE_URL environment variable format,
  // where dataset names map to the uppercase name with _SITE_URL appended.
  thisConfig.map.layers.forEach((layer, i) => {
    if (datasetSiteUrls[layer.id.toUpperCase() + "_SITE_URL"]) {
      thisConfig.map.layers[i].url =
        datasetSiteUrls[layer.id.toUpperCase() + "_SITE_URL"];
    }
  });

  // The API root is defined in the config. In most cases this will be set to 
  // point to the dev API. If the .env defines a different API root, use that
  // value here. Use the API_ROOT key in the .env to set a new API root. Note
  // that this replaces the old SITE_URL key.
  if (process.env.API_ROOT) {
    thisConfig.app.api_root = process.env.API_ROOT;
  }

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
    logError("Error copying base jstemplates assets: " + e);
  }

  try {
    fs.copySync(
      flavorJSTemplatesPath,
      outputJSTemplatesPath
    );
  } catch (e) {
    logError("Error copying flavor jstemplates assets: " + e);
  }

  try {
    fs.copySync(
      flavorPagesPath,
      outputJSTemplatesPath
    );
  } catch (e) {
    logError("Error copying flavor pages assets: " + e);
  }

  log("Finished copying jstemplates assets");

  // Localize jstemplates
  let templatePath,
      localizedTemplate;
  fs.readdirSync(outputJSTemplatesPath).forEach((jsTemplate) => {
    if (jsTemplate.endsWith("html")) {
      templatePath = path.resolve(outputJSTemplatesPath, jsTemplate);
      localizedTemplate = fs.readFileSync(
        templatePath,
        "utf8"
      ).replace(
        jsTemplatesGettextRegex,
        (match, capture) => {
          return gt.gettext(capture);
        }
      );

      fs.writeFileSync(
        templatePath,
        localizedTemplate,
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
  log("Finished jstemplates compilation for " + language.code);

  // Build the index-xx.html file for this language
  outputIndexFile = indexTemplate({
    production: (process.env.NODE_ENV === "production" ? true : false),
    jsHashedBundleName: jsHashedBundleName,
    cssHashedBundleName: cssHashedBundleName,
    config: thisConfig,
    settings: {
      mapboxToken: process.env.MAPBOX_TOKEN || "",
      clickyAnalyticsId: process.env.CLICKY_ANALYTICS_ID || "",
      mapQuestKey: process.env.MAPQUEST_KEY || "",
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || "",
      googleAnalyticsDomain: process.env.GOOGLE_ANALYTICS_DOMAIN || "auto"
    },
    languageCode: language.code,

    // TODO: fix this...
    userTokenJson: ""
  });

  // Write out final index-xx.html file
  outputIndexFilename = path.resolve(
    outputBasePath,
    (language.code == "en_US" ? "index" : language.code) + ".html"
  );
  fs.writeFileSync(outputIndexFilename, outputIndexFile);
});


// (6) Move static image assets to the dist/ folder. Copy base project assets
//     first, then copy flavor assets, overriding base assets as needed
// -----------------------------------------------------------------------------

// Copy base project static image assets to src/base/static/dist/images
const baseImageAssetsPath = path.resolve(
  __dirname,
  "src/base/static/css/images"
);
const outputImageAssetsPath = path.resolve(
  outputBasePath,
  "static/css/images"
);
try {
  fs.copySync(
    baseImageAssetsPath,
    outputImageAssetsPath
  );
} catch (e) {
  logError("Error copying base image assets: " + e);
}

// Copy flavor static image assets to www/images, replacing base assets as
// necessary
const flavorImageAssetsPath = path.resolve(
  flavorBasePath,
  "static/css/images"
);
try {
  fs.copySync(
    flavorImageAssetsPath,
    outputImageAssetsPath
  );
} catch (e) {
  logError("Error copying flavor image assets: " + e);
}

// Copy font files
const fontPaths = glob.sync(
  flavorBasePath +
  "/static/css/+(*.ttf|*.otf|*.woff|*.woff2)"
);
fontPaths.forEach((fontPath) => {
  try {
    fs.copySync(
      path.resolve(
        flavorBasePath,
        fontPath
      ),
      path.resolve(
        outputBasePath,
        "static/css",
        fontPath.split("/").slice(-1)[0]
      )
    );
  } catch (e) {
    logError("Error copying font file: " + e);
  }
});

try {
  fs.copySync(
    path.resolve(
      __dirname,
      "src/base/static/libs"
    ),
    path.resolve(
      outputBasePath,
      "libs"
    )
  );
} catch (e) {
  logError("Error copying flavor libs files: " + e);
}

log("BUILD FINISHED for " + flavor);

// =============================================================================
// END STATIC SITE BUILD
// =============================================================================
