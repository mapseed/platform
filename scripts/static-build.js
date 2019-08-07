/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config({ path: "src/.env" });
const path = require("path");
const fs = require("fs-extra");
const glob = require("glob");
const colors = require("colors");
const Spritesmith = require("spritesmith");
const shell = require("shelljs");

const {
  setConfigDefaults,
  transformCommonFormElements,
} = require("../src/base/static/utils/config-loader-utils");

const verbose = true;
const isProd = process.env.NODE_ENV === "production";

shell.mkdir(__dirname, "../www");
const outputPath = path.resolve(__dirname, "../www");

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

// Prepare the config file.
// -----------------------------------------------------------------------------

const flavorConfigPath = path.resolve(flavorBasePath, "config.json");
const config = JSON.parse(fs.readFileSync(flavorConfigPath, "utf8"));
setConfigDefaults(config);

// Dataset urls are defined in the config. In most cases urls listed in the
// config will be dev-api urls. If the .env defines a different dataset url
// for a given dataset, use that value here.
// Note that we retain the <DATASET>_SITE_URL environment variable format,
// where dataset names map to the uppercase name with _SITE_URL appended.
const datasetSiteUrls = {};
Object.keys(process.env).forEach(function(key) {
  if (key.endsWith("SITE_URL")) {
    datasetSiteUrls[key] = process.env[key];
  }
});
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

// Resolve fields of type common_form_element.
config.place.place_detail = transformCommonFormElements(
  config.place.place_detail,
  config.place.common_form_elements,
);

// Write out the config file.
fs.writeFileSync(path.resolve(outputPath, `config.js`), JSON.stringify(config));

// Move static image assets to the build folder. Copy base project assets
// first, then copy flavor assets, overriding base assets as needed.
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

// Copy flavor image assets, replacing base assets as necessary.
const flavorImageAssetsPath = path.resolve(flavorBasePath, "static/css/images");

try {
  fs.copySync(flavorImageAssetsPath, outputImageAssetsPath);
} catch (e) {
  logError("Error copying flavor image assets: " + e);
  throw e;
}

try {
  fs.copySync(
    path.resolve(__dirname, "../src/base/static/legacy-libs"),
    path.resolve(outputPath, "legacy-libs"),
  );
} catch (e) {
  logError("Error copying flavor libs files: " + e);
  throw e;
}

// Build the symbol spritesheet for Mapbox.
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
