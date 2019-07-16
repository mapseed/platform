/* eslint-disable @typescript-eslint/no-var-requires */
const {
  setConfigDefaults,
  transformCommonFormElements,
} = require("../src/base/static/utils/config-loader-utils");

// This loader is used to listen to changes in the config file during development.
// Any config changes will be detected and the config (but not the rest of the
// static site) will be rebuilt.

module.exports = function(source) {
  source = source.substring(17);

  const datasetSiteUrls = {};
  const config = JSON.parse(source);

  Object.keys(process.env).forEach(function(key) {
    if (key.endsWith("SITE_URL")) {
      datasetSiteUrls[key] = process.env[key];
    }
  });

  setConfigDefaults(config);

  // If we have dataset urls defined in the .env file, overwrite the default
  // urls found in the config here.
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

  return JSON.stringify(config);
};
