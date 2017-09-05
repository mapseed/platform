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

shell.mkdir("-p", "www");
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
//   - Error checking on fs.readFileSync calls
// =============================================================================


// (1) Set up paths to certain files and directories needed for the build, as 
//     well as utilities
// -----------------------------------------------------------------------------

// Control logging output
const verbose = true; 

// This version number is only used for cache-busting on our bundle.js,
// bundle.css, and custom.css files.
const bundleVersion = "0.7.5.5";

const flavorBasePath = path.resolve(
  __dirname,
  "src/flavors",
  process.env.FLAVOR
);
const outputBasePath = path.resolve(
  __dirname, 
  "www"
);

// Pull out dataset urls from the .env file. We ignore the keys, as they're no
// longer needed.
let datasetSiteUrls = {};
Object.keys(process.env).forEach(function(key) {
  if (key.endsWith("SITE_URL")) {
    datasetSiteUrls[key] = process.env[key];
  }
});

// Logging
const log = (msg) => {
  if (verbose) {
    console.log("(STATIC SITE BUILD) ", msg);
  }
};


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
  __dirname,
  "src/base/static/dist/jstemplates"
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
  __dirname,
  "src/base/static/dist/django.po"
);
const activeLanguages = (config.languages)
  ? config.languages
  : [{ code: "en_US" }];

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
    "LC_MESSAGES/django.po"
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
        "LC_MESSAGES/django.po"
      )
    );
    mergedPOFile = fs.readFileSync(mergedPOFileOutputPath);
    log("Finsihed merging .po file for " + language.code);
  } catch(e) {
    log("(ERROR!) Error merging .po file for " + language.code);
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
      }

      obj[prop] = gt.gettext(val);
    }
  });
  log("Finished localizing config for " + language.code);

  // Add dataset site urls
  thisConfig["datasets"] = datasetSiteUrls;

  // Make the API root path, replacing the old proxy server make_api_root method
  rootComponents = thisConfig.datasets.SITE_URL.split("/");
  protocol = rootComponents[0];
  if (thisConfig.datasets.SITE_URL.endsWith("/")) {
    rootComponents = rootComponents.slice(2, -4).join("/");
  } else {
    rootComponents = rootComponents.slice(2, -3).join("/");
  }
  thisConfig.datasets.API_ROOT = [
    protocol,
    "//",
    rootComponents,
    "/"
  ].join("");


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
    bundleVersion: bundleVersion,
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
    userTokenJson: "",

    // TODO: user agent identification needs to be moved client-side
    userAgentJson: {
      browser: {
        name: "some browser name"
      }
    }
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
  log("(ERROR!) Error copying base image assets: " + e);
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
      outputBasePath,
      "custom.css"
    )
  );
} catch (e) {
  log("(ERROR!) Error copying flavor custom.css: " + e);
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
    log("(ERROR!) Error copying font file: " + e);
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
  log("(ERROR!) Error copying flavor libs files: " + e);
}

log("BUILD FINISHED");

// =============================================================================
// END STATIC SITE BUILD
// =============================================================================
