// NOTE: These utility methods transform sections of the config for use by the app.
// TODO: I don't like this very much, because it means sections of the config
// aren't declarative. Ideally we should revisit this at some point and
// refactor.

// Transform the story section of the config to build the data structure we
// need for story navigation.
const transformStoryContent = storyConfig => {
  Object.values(storyConfig).forEach(story => {
    const numChapters = story.order.length;
    const storyStructure = {};

    story.order.forEach((chapter, i) => {
      storyStructure[chapter.url] = {
        zoom: chapter.zoom || story.default_zoom,
        hasCustomZoom: chapter.zoom ? true : false,
        panTo: chapter.panTo || null,
        visibleLayers: chapter.visible_layers || story.default_visible_layers,
        previous: story.order[(i - 1 + numChapters) % numChapters].url,
        next: story.order[(i + 1) % numChapters].url,
        basemap: chapter.basemap || story.default_basemap,
        spotlight: chapter.spotlight === false ? false : true,
        sidebarIconUrl: chapter.sidebar_icon_url,
      };
    });
    story.order = storyStructure;
  });

  return storyConfig;
};

// Transform the place_detail section of the config to resolve
// common_form_element references.
const transformCommonFormElements = (placeDetail, commonFormElements) => {
  placeDetail.forEach(category => {
    category.fields = category.fields.map(field => {
      if (field.type === "common_form_element") {
        return Object.assign({}, commonFormElements[field.name], {
          name: field.name,
        });
      } else {
        return field;
      }
    });
  });

  return placeDetail;
};

module.exports = {
  transformStoryContent: transformStoryContent,
  transformCommonFormElements: transformCommonFormElements,
};
