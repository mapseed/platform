<<<<<<< 75929a63b3d885ba47ee4689000259882409b50b
const walk = require("object-walk");
=======
const Gettext = require("node-gettext");
const gettextParser = require("gettext-parser");
//const walk = require("object-walk");
>>>>>>> chore(static site) watch config in dev mode and rebuild
const Handlebars = require("handlebars");
const fs = require('fs-extra');
const path = require('path');

<<<<<<< 75929a63b3d885ba47ee4689000259882409b50b
// This loader is used to listen to changes in the config file during development.
// Any config changes will be detected and the config (but not the rest of the
// static site) will be rebuilt. This loader only rebuilds the English version
// of the config; to test other languages in development it will be necessary
// to produce a full production build:
//   npm run build
// Or, to build in production mode and also start the dev server:
//   NODE_ENV=production npm start

const configGettextRegex = /^_\(/;
=======
>>>>>>> chore(static site) watch config in dev mode and rebuild

Handlebars.registerHelper("serialize", function(json) {
  if (!json) return false;
  return JSON.stringify(json);
});

module.exports = function(source) {

<<<<<<< 75929a63b3d885ba47ee4689000259882409b50b
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

  // The API root is defined in the config. In most cases this will be set to 
  // point to the dev API. If the .env defines a different API root, use that
  // value here. Use the API_ROOT key in the .env to set a new API root. Note
  // that this replaces the old SITE_URL key.
  if (process.env.API_ROOT) {
    config.app.api_root = process.env.API_ROOT;
  }

  // Strip out gettext syntax; we don't perform any localization of the config
  // in this loader. Full localization is performed by the production build.
  walk(config, (val, prop, obj) => {
    if (typeof val === "string") {
      if (configGettextRegex.test(val)) {
        val = val
          .replace(configGettextRegex, "")
          .replace(/\)$/, "");
        obj[prop] = val;
      }
    }
  });

  const templateSource = fs.readFileSync(
    path.resolve(
      __dirname,
      "../build-utils/config-template.hbs"
    ),
    "utf8"
  );
  const template = Handlebars.compile(templateSource);
  outputFile = template({
    config: config,
=======
	// TODO: attach datasets object

	source = source.substring(17);

	const templateSource = fs.readFileSync(
	  path.resolve(
	  	__dirname,
	    "config-template.hbs"
	  ),
	  "utf8"
	);
	const template = Handlebars.compile(templateSource);
	outputFile = template({
    config: JSON.parse(source),
>>>>>>> chore(static site) watch config in dev mode and rebuild
  });

  outputPath = path.resolve(
    __dirname,
    "../www/dist/config-en_US.js"
  );
  try {
    fs.writeFileSync(outputPath, outputFile);
  } catch (e) {
    // ignore exceptions
  }

<<<<<<< 75929a63b3d885ba47ee4689000259882409b50b
  return source;
}
=======
	return source;
}
>>>>>>> chore(static site) watch config in dev mode and rebuild
