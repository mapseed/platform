// NOTE: These utility methods transform sections of the config for use by the app.

// Transform the story section of the config to build the data structure we
// need for story navigation.
const transformStoryContent = storyConfig => {
  if (!storyConfig) return;
  return Object.entries(storyConfig).reduce(
    (stories, [storyName, storyContent]) => {
      const numChapters = storyContent.order.length;
      stories[storyName] = {
        header: storyContent.header,
        description: storyContent.description,
        chapters: storyContent.order.map((chapter, i) => {
          return {
            placeId: chapter.placeId,
            zoom: chapter.zoom || storyContent.default_zoom,
            hasCustomZoom: !!chapter.zoom,
            panTo: chapter.pan_to || null,
            visibleLayers:
              chapter.visible_layers || storyContent.default_visible_layers,
            previous:
              storyContent.order[(i - 1 + numChapters) % numChapters].url,
            next: storyContent.order[(i + 1) % numChapters].url,
            basemap: chapter.basemap || storyContent.default_basemap,
            spotlight: chapter.spotlight === false ? false : true,
            sidebarIconUrl: chapter.sidebar_icon_url,
          };
        }),
      };

      return stories;
    },
    {},
  );
};

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
  if (!config.app.hasOwnProperty("show_timestamps")) {
    config.app.show_timestamps = true;
  }
  // `time_zone`:
  if (!config.app.time_zone) {
    config.app.time_zone = "America/Los_Angeles";
  }
};

module.exports = {
  transformStoryContent,
  transformCommonFormElements,
  setConfigDefaults,
};
