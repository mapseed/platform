const configPreprocessor = require("./config-preprocessor");

// This loader is used to preprocess the config.
module.exports = function(source) {
  // Strip `module.exports =` from the beginning of the source.
  source = source.substring(17);
  const config = JSON.parse(source);

  const preprocessedConfig = configPreprocessor(config);

  return JSON.stringify(preprocessedConfig);
};
