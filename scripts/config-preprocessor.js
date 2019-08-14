/* eslint-disable @typescript-eslint/no-var-requires */
const {
  setConfigDefaults,
  transformCommonFormElements,
} = require("../src/base/static/utils/config-loader-utils");

module.exports = function(config) {
  setConfigDefaults(config);

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

  return config;
};
