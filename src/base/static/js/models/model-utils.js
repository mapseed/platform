import { story as storyConfig } from "config";
import constants from "../../constants";

var normalizeModelArguments = function(key, val, options) {
  var attrs;
  if (key === null || _.isObject(key)) {
    attrs = key;
    options = val;
  } else if (key !== null) {
    (attrs = {})[key] = val;
  }
  options = options ? _.clone(options) : {};

  return {
    options: options,
    attrs: attrs,
  };
};

const addStoryObj = response => {
  if (!storyConfig) return;
  const url = response.properties[constants.CUSTOM_URL_PROPERTY_NAME]
    ? response.properties[constants.CUSTOM_URL_PROPERTY_NAME]
    : response.properties.datasetSlug + "/" + response.properties.id;

  const storyObj = Object.values(storyConfig).reduce((chapter, story) => {
    chapter = story.chapters.find(chapter => {
      return chapter.url === url;
    });
    return chapter;
  }, {});

  if (storyObj) {
    return { story: storyObj };
  }
};

// Pull out the full title string from the block of HTML used
// to render the landmark
var addLandmarkDescription = function(properties) {
  var fullTitle,
    re = /^\s*<(h[0-9]|b)>(.+?)<(\/h[0-9]|\/b)>/,
    // Grab the full title from between header or bold tags at the beginning
    // of the HTML block
    match = properties.description.match(re);
  if (match) {
    // the second capture group represents the full title
    fullTitle = match[2];
    properties.originalDescription = properties.description;
    properties.description = properties.description.replace(re, "");
  } else {
    properties.originalDescription = properties.description;
    fullTitle = properties.title;
  }
  return { fullTitle: fullTitle };
};

module.exports = {
  normalizeModelArguments: normalizeModelArguments,
  addStoryObj: addStoryObj,
  addLandmarkDescription: addLandmarkDescription,
};
