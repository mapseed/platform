import Immutable from "immutable";

const hydrateStoriesFromConfig = ({ places, storyConfig }) => {
  // TODO(luke): Clean up this logic when Places are migrated into our
  // Redux store.
  const hydratedStories = Object.entries(storyConfig).reduce(
    (stories, storyEntry) => {
      const storyName = storyEntry[0];
      return stories.set(
        storyEntry[0],
        Immutable.Map()
          .set(
            "chapters",
            storyEntry[1].chapters.reduce((urlToPlaceModel, chapter) => {
              const model = places.find(place => {
                const placeId = parseInt(chapter.url.split("/")[1]);
                return place.id === placeId;
              });
              if (model) {
                return urlToPlaceModel.set(
                  chapter.url,
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
