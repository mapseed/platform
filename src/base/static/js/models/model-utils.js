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

var addStoryObj = function(response, type) {
  var storyObj = null,
    url;

  if (type === "place") {
    if (response.properties["url-title"]) {
      url = response.properties["url-title"];
    } else {
      url = response.properties.datasetSlug + "/" + response.properties.id;
    }
  } else if (type === "landmark") {
    url = response.title;
  }

  _.each(Shareabouts.Config.story, function(story) {
    if (story.order[url]) {
      storyObj = {
        tagline: story.tagline,
        next: story.order[url].next,
        previous: story.order[url].previous,
        zoom: story.order[url].zoom,
        panTo: story.order[url].panTo,
        visibleLayers: story.order[url].visibleLayers,
        basemap: story.order[url].basemap,
        spotlight: story.order[url].spotlight,
        hasCustomZoom: story.order[url].hasCustomZoom,
        sidebarIconUrl: story.order[url].sidebarIconUrl,
      };
    }
  });
  return { story: storyObj };
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
