// NOTE: These utility methods transform sections of the config for use by the app.

// Transform the place_detail section of the config to resolve
// common_form_element references.

const transformCommonFormElements = (placeDetail, commonFormElements) => {
  return placeDetail.map(category => {
    category.fields = category.fields.map(field => {
      if (field.type === "common_form_element") {
        return Object.assign({}, commonFormElements[field.name], {
          name: field.name,
        });
      } else {
        return field;
      }
    });

    return category;
  });
};

const setConfigDefaults = config => {
  // set the default values for our config:

  // `show_timestamps`:
  // eslint-disable-next-line no-prototype-builtins
  if (!config.app.hasOwnProperty("show_timestamps")) {
    config.app.show_timestamps = true;
  }
  // `time_zone`:
  if (!config.app.time_zone) {
    config.app.time_zone = "America/Los_Angeles";
  }
};

module.exports = {
  transformCommonFormElements,
  setConfigDefaults,
};
