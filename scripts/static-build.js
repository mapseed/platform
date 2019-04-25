require("dotenv").config({ path: "src/.env" });
const path = require("path");
const fs = require("fs-extra");
const Handlebars = require("handlebars");
const glob = require("glob");
const colors = require("colors");
const Spritesmith = require("spritesmith");
const shell = require("shelljs");
const zlib = require("zlib");

const {
  setConfigDefaults,
  transformCommonFormElements,
  transformStoryContent,
} = require("../src/base/static/utils/config-loader-utils");

// =============================================================================
// BEGIN STATIC SITE BUILD
//
// Overview:
// (1) Configure paths, variables, and utilities
// (2) Set up Handlebars helpers
// (3) Convert config yaml to JSON object
// (4) Compile base Handlebars template
// (5) Build index file
// (6) Copy static assets to the dist/ folder
// (7) Build mapbox symbol spritesheet
//
// TODOS
//   - Asynchronous processing!
// =============================================================================

// (1) Set up paths to certain files and directories needed for the build, as
//     well as utilities
// -----------------------------------------------------------------------------

// Control logging output
const verbose = true;

const isProd = process.env.NODE_ENV === "production";
shell.mkdir(__dirname, "../www");
const outputPath = path.resolve(__dirname, "../www");

let jsHashedBundleName, cssHashedBundleName;
glob.sync(outputPath + "/+(*.main.bundle.js|*.bundle.css)").forEach(path => {
  path = path.split("/");
  if (path[path.length - 1].endsWith("js")) {
    jsHashedBundleName = path[path.length - 1] + ".gz";
  } else if (path[path.length - 1].endsWith("css")) {
    cssHashedBundleName = path[path.length - 1] + ".gz";
  }
});

// Logging
const log = msg => {
  if (verbose) {
    // eslint-disable-next-line no-console
    console.log("(STATIC SITE BUILD)", colors.green("(SUCCESS)"), msg);
  }
};
const logError = msg => {
  // eslint-disable-next-line no-console
  console.error("(STATIC SITE BUILD)", colors.red("(ERROR!)"), msg);
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

const flavorBasePath = path.resolve(__dirname, "../src/flavors", flavor);

// Pull out dataset urls from the .env file. We ignore the keys, as they're no
// longer needed.
let datasetSiteUrls = {};
Object.keys(process.env).forEach(function(key) {
  if (key.endsWith("SITE_URL")) {
    datasetSiteUrls[key] = process.env[key];
  }
});

// (2) Register Handlebars helpers
// -----------------------------------------------------------------------------

// (3) Parse the config json file
// -----------------------------------------------------------------------------

const flavorConfigPath = path.resolve(flavorBasePath, "config.json");
const config = JSON.parse(fs.readFileSync(flavorConfigPath, "utf8"));

setConfigDefaults(config);

// (4) Compile base.hbs template
// -----------------------------------------------------------------------------

const source = fs.readFileSync(
  path.resolve(__dirname, "../src/base/templates/base.hbs"),
  "utf8",
);
const indexTemplate = Handlebars.compile(source);

// (5) Inject environment variable overrides and build the index.html file.
// -----------------------------------------------------------------------------

// Dataset urls are defined in the config. In most cases urls listed in the
// config will be dev-api urls. If the .env defines a different dataset url
// for a given dataset, use that value here.
// Note that we retain the <DATASET>_SITE_URL environment variable format,
// where dataset names map to the uppercase name with _SITE_URL appended.
config.datasets.forEach((dataset, i) => {
  if (datasetSiteUrls[dataset.slug.toUpperCase() + "_SITE_URL"]) {
    config.datasets[i].url =
      datasetSiteUrls[dataset.slug.toUpperCase() + "_SITE_URL"];
  }
});

// The API root is defined in the config. In most cases this will be set to
// point to the dev API. If the .env defines a different API root, use that
// value here. Use the API_ROOT key in the .env to set a new API root. Note
// that this replaces the old SITE_URL key.
if (process.env.API_ROOT) {
  config.app.api_root = process.env.API_ROOT;
}

// Determine if we should include Google Analytics for this flavor.
// Analytics ids are defined in the .env file, and follow this format:
// <FLAVOR>_GOOGLE_ANALYTICS_ID
// We only include analytics on production builds.
let googleAnalyticsId = "";
if (isProd && process.env[flavor.toUpperCase() + "_GOOGLE_ANALYTICS_ID"]) {
  log("Including Google Analytics for " + flavor);
  googleAnalyticsId =
    process.env[flavor.toUpperCase() + "_GOOGLE_ANALYTICS_ID"];
}

// Resolve fields of type common_form_element.
config.place.place_detail = transformCommonFormElements(
  config.place.place_detail,
  config.place.common_form_elements,
);

// Build the story data structure used by the app.
config.story = transformStoryContent(config.story);

// Build the index-xx.html file for this language
const outputIndexFile = indexTemplate({
  production: isProd,
  serviceWorkerPath: "/service-worker.js",
  jsHashedBundleName: jsHashedBundleName,
  cssHashedBundleName: cssHashedBundleName,
  config: config,
  flavor: flavor,
  settings: {
    mapboxToken: process.env.MAPBOX_TOKEN || "",
    clickyAnalyticsId: process.env.CLICKY_ANALYTICS_ID || "",
    mapQuestKey: process.env.MAPQUEST_KEY || "",
    googleAnalyticsId: googleAnalyticsId,
    googleAnalyticsDomain: process.env.GOOGLE_ANALYTICS_DOMAIN || "auto",
  },

  // TODO: fix this...
  userTokenJson: "",
});

// Write out the localized config file.
fs.writeFileSync(
  path.resolve(outputPath, `config.js`),
  process.env.NODE_ENV === "production"
    ? zlib.gzipSync(JSON.stringify(config))
    : JSON.stringify(config),
);

// Write out final xx.html file
const outputIndexFilename = path.resolve(outputPath, "index.html");

if (isProd) {
  try {
    fs.writeFileSync(outputIndexFilename, zlib.gzipSync(outputIndexFile));
  } catch (e) {
    logError("Error gzipping and outputting index file: " + e);
    throw e;
  }
} else {
  fs.writeFileSync(outputIndexFilename, outputIndexFile);
}

// (6) Move static image assets to the dist/ folder. Copy base project assets
//     first, then copy flavor assets, overriding base assets as needed
// -----------------------------------------------------------------------------

// Copy base project static image assets to src/base/static/dist/images
const baseImageAssetsPath = path.resolve(
  __dirname,
  "../src/base/static/css/images",
);
const outputImageAssetsPath = path.resolve(outputPath, "static/css/images");

try {
  fs.copySync(baseImageAssetsPath, outputImageAssetsPath);
} catch (e) {
  logError("Error copying base image assets: " + e);
  throw e;
}

// Copy flavor static image assets to www/images, replacing base assets as
// necessary
const flavorImageAssetsPath = path.resolve(flavorBasePath, "static/css/images");

try {
  fs.copySync(flavorImageAssetsPath, outputImageAssetsPath);
} catch (e) {
  logError("Error copying flavor image assets: " + e);
  throw e;
}

// Copy font files
const baseFontsDir = path.resolve(__dirname, "../src/base");
let fontPaths = glob
  .sync(flavorBasePath + "/static/css/+(*.ttf|*.otf|*.woff|*.woff2)")
  .concat(
    glob.sync(baseFontsDir + "/static/css/+(*.ttf|*.otf|*.woff|*.woff2)"),
  );

fontPaths.forEach(fontPath => {
  try {
    fs.copySync(
      fontPath,
      path.resolve(outputPath, "static/css", fontPath.split("/").slice(-1)[0]),
    );
  } catch (e) {
    logError("Error copying font file: " + e);
    throw e;
  }
});

try {
  fs.copySync(
    path.resolve(__dirname, "../src/base/static/legacy-libs"),
    path.resolve(outputPath, "legacy-libs"),
  );
} catch (e) {
  logError("Error copying flavor libs files: " + e);
  throw e;
}

// (6) Build the symbol spritesheet for mapbox.
// -----------------------------------------------------------------------------

const distMarkersPath = path.resolve(
  __dirname,
  "../www/static/css/images/markers",
);
const markers = glob.sync(
  path.resolve(distMarkersPath, "*.{png,jpg,jpeg,gif}"),
);

Spritesmith.run({ src: markers }, (err, result) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error(
      "(STATIC SITE BUILD)",
      colors.red("(ERROR)"),
      "Error generating marker spritesheets:",
      err,
    );

    process.exitCode = 1;
    process.exit();
  }

  fs.writeFileSync(
    path.resolve(distMarkersPath, "spritesheet.png"),
    result.image,
  );
  fs.writeFileSync(
    // For high-resolution devices; Mapbox expects this file.
    path.resolve(distMarkersPath, "spritesheet@2x.png"),
    result.image,
  );

  // Postprocess the coordinates object.
  const coordinates = Object.keys(result.coordinates).reduce(
    (coordinateMapping, spriteIdentifier) => {
      const newSpriteIdentifier = path.basename(spriteIdentifier);

      coordinateMapping[newSpriteIdentifier] = Object.assign(
        result.coordinates[spriteIdentifier],
        { pixelRatio: 1 },
      );
      return coordinateMapping;
    },
    {},
  );

  fs.writeFileSync(
    path.resolve(distMarkersPath, "spritesheet.json"),
    JSON.stringify(coordinates),
  );
  fs.writeFileSync(
    // For high-resolution devices; Mapbox expects this file.
    path.resolve(distMarkersPath, "spritesheet@2x.json"),
    JSON.stringify(coordinates),
  );

  // eslint-disable-next-line no-console
  console.log(
    "(STATIC SITE BUILD)",
    colors.green("(SUCCESS)"),
    "Marker spritesheets and metadata created",
  );

  log("STATIC SITE BUILD FINISHED for " + flavor);
});

// =============================================================================
// END STATIC SITE BUILD
// =============================================================================
