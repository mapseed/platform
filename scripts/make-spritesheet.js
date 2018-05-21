/* global __dirname process */

require("dotenv").config({ path: "src/.env" });

const fs = require("fs-extra");
const Spritesmith = require("spritesmith");
const glob = require("glob");
const path = require("path");

const distMarkersPath = path.resolve(
  __dirname,
  "../www/static/css/images/markers",
);

const markers = glob.sync(
  path.resolve(distMarkersPath, "*.{png,jpg,jpeg,gif}"),
);

Spritesmith.run({ src: markers }, (err, result) => {
  if (err) {
    console.log("Spritesmith error:", err);

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
    path.resolve(distMarkersPath, "spritesheet.json"),
    JSON.stringify(result.coordinates),
  );
  fs.writeFileSync(
    // For high-resolution devices; Mapbox expects this file.
    path.resolve(distMarkersPath, "spritesheet@2x.json"),
    JSON.stringify(result.coordinates),
  );

  console.log("Done! Spritesheets and metadata created.");
});
