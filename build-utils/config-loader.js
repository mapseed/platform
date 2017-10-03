const walk = require("object-walk");
const Handlebars = require("handlebars");
const fs = require('fs-extra');
const path = require('path');

// This loader is used to listen to changes in the config file during development.
// Any config changes will be detected and the config (but not the rest of the
// static site) will be rebuilt. This loader only rebuilds the English version
// of the config; to test other languages in development it will be necessary
// to produce a full production build:
//   npm run build
// Or, to build in production mode and also start the dev server:
//   NODE_ENV=production npm start

const configGettextRegex = /^_\(/;

Handlebars.registerHelper("serialize", function(json) {
  if (!json) return false;
  return JSON.stringify(json);
});

module.exports = function(source) {

  source = source.substring(17);

  let datasetSiteUrls = {}
    config = JSON.parse(source);

  Object.keys(process.env).forEach(function(key) {
    if (key.endsWith("SITE_URL")) {
      datasetSiteUrls[key] = process.env[key];
    }
  });

  // If we have dataset urls defined in the .env file, overwrite the default
  // urls found in the config here.
  config.map.layers.forEach((layer, i) => {
    if (datasetSiteUrls[layer.id.toUpperCase() + "_SITE_URL"]) {
      config.map.layers[i].url =
        datasetSiteUrls[layer.id.toUpperCase() + "_SITE_URL"];
    }
  });

  // Strip out gettext syntax; we don't perform any localization of the config
  // in this loader. Full localization is performed by the production build.
  walk(config, (val, prop, obj) => {
    if (typeof val === "string") {
      if (configGettextRegex.test(val)) {
        val = val
          .replace(configGettextRegex, "")
          .replace(/\)$/, "");
      }
    }

    obj[prop] = val;
  });

  const templateSource = fs.readFileSync(
    path.resolve(
      __dirname,
      "config-template.hbs"
    ),
    "utf8"
  );
  const template = Handlebars.compile(templateSource);
  outputFile = template({
    config: config,
  });

  outputPath = path.resolve(
    __dirname,
    "../www/dist/config-en_US.js"
  );
  fs.writeFileSync(outputPath, outputFile);

  return source;
}
