import Immutable from "immutable";

const hydrateStoriesFromConfig = ({ places, storyConfig }) => {
  // TODO(luke): Clean up this logic when Places are migrated into our
  // Redux store.
  const hydratedStories = Object.entries(storyConfig).reduce(
    (stories, storyEntry) => {
      const storyName = storyEntry[0];

      return stories.set(
        storyName,
        Immutable.Map()
          .set(
            "chapters",
            storyEntry[1].chapters.reduce((urlToPlaceModel, chapter) => {
              const model = places.find(place => {
                return parseInt(place.id) === parseInt(chapter.placeId);
              });
              if (model) {
                return urlToPlaceModel.set(
                  chapter.placeId,
                  Immutable.fromJS(model).set(
                    "sidebarIconUrl",
                    chapter.sidebarIconUrl,
                  ),
                );
              } else {
                return urlToPlaceModel;
              }
            }, Immutable.OrderedMap()),
          )
          .set("header", storyConfig[storyName].header)
          .set("description", storyConfig[storyName].description)
          .set("name", storyName),
      );
    },
    Immutable.OrderedMap(),
  );
  return hydratedStories;
};

export { hydrateStoriesFromConfig };
