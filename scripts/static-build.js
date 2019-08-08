/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config({ path: "src/.env" });
const path = require("path");
const fs = require("fs-extra");
const glob = require("glob");
const colors = require("colors");
const Spritesmith = require("spritesmith");
const shell = require("shelljs");

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
