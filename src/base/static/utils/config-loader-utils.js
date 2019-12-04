// NOTE: These utility methods transform sections of the config for use by the app.
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
  setConfigDefaults,
};
