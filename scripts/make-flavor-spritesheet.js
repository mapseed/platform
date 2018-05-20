/* global __dirname process */

// TODO: Reconcile with base project marker assets.

require("dotenv").config({ path: "src/.env" });

const fs = require("fs-extra");
const Spritesmith = require("spritesmith");
const glob = require("glob");
const path = require("path");
const shell = require("shelljs");

const flavorMarkersPath = path.resolve(
  __dirname,
  "../src/flavors",
  process.env.FLAVOR,
  "static/css/images/markers",
);

// Remove old spritesheets so they don't get baked into the new spritesheets!
shell.rm(path.resolve(flavorMarkersPath, "spritesheet.png"));
shell.rm(path.resolve(flavorMarkersPath, "spritesheet@2x.png"));

const flavorMarkers = glob.sync(
  path.resolve(flavorMarkersPath, "*.{png,jpg,jpeg,gif}"),
);

Spritesmith.run({ src: flavorMarkers }, (err, result) => {
  if (err) {
    console.log("Spritesmith error:", err);

    process.exitCode = 1;
    process.exit();
  }

  fs.writeFileSync(
    path.resolve(flavorMarkersPath, "spritesheet.png"),
    result.image,
  );
  fs.writeFileSync(
    // For high-resolution devices; Mapbox expects this file.
    path.resolve(flavorMarkersPath, "spritesheet@2x.png"),
    result.image,
  );

  // Postprocess the coordinates object.
  Object.keys(result.coordinates).forEach(spriteIdentifier => {
    const newSpriteIdentifier = path
      .basename(spriteIdentifier)
      // e.g.: my-test-marker.png -> my-test-marker
      .replace(/\.[A-Za-z0-9\-_]+$/, "");

    result.coordinates[newSpriteIdentifier] =
      result.coordinates[spriteIdentifier];
    delete result.coordinates[spriteIdentifier];

    // Required by Mapbox.
    result.coordinates[newSpriteIdentifier].pixelRatio = 1;
  });

  fs.writeFileSync(
    path.resolve(flavorMarkersPath, "spritesheet.json"),
    JSON.stringify(result.coordinates),
  );
  fs.writeFileSync(
    // For high-resolution devices; Mapbox expects this file.
    path.resolve(flavorMarkersPath, "spritesheet@2x.json"),
    JSON.stringify(result.coordinates),
  );

  console.log("Done! Spritesheets and metadata created.");
});
