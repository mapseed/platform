import { Map, OrderedMap, fromJS } from "immutable";
import { story as storyConfig } from "config";

import { getModelFromUrl } from "./collection-utils";

const hydrateStoriesFromConfig = (placeCollectionPromises, places) => {
  return new Promise((resolve, reject) => {
    Promise.all(placeCollectionPromises)
      .then(() => {
        const stories = Object.entries(storyConfig).reduce(
          (stories, storyEntry) => {
            const storyName = storyEntry[0];
            return stories.set(
              storyEntry[0],
              Map()
                .set(
                  "chapters",
                  storyEntry[1].chapters.reduce((chapters, chapter) => {
                    return chapters.set(
                      chapter.url,
                      fromJS(
                        getModelFromUrl(places, chapter.url).attributes,
                      ).set("sidebarIconUrl", chapter.sidebarIconUrl),
                    );
                  }, OrderedMap()),
                )
                .set("header", storyConfig[storyName].header)
                .set("description", storyConfig[storyName].description)
                .set("name", storyName),
            );
          },
          OrderedMap(),
        );
        resolve(stories);
      })
      .catch(e => {
        reject(e);
      });
  });
};

export { hydrateStoriesFromConfig };
