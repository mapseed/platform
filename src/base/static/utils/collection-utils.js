import constants from "../constants";
import { map as mapConfig } from "config";

// Given a route and a POJO of Backbone collections, return the model that
// matches the route if it exists.
const getModelFromUrl = (collections, route) => {
  const splitRoute = route.split("/");

  // If the url has a slash in it with text on either side, we assume we have
  // a place model url and can look up the model directly.
  if (splitRoute.length === 2) {
    return (
      collections[
        mapConfig.layers.find(layerConfig => layerConfig.slug === splitRoute[0]).id
      ].get(splitRoute[1]) || {}
    );
  } else {
    // Otherwise, we have a "landmark-style" url, and have to search all place
    // collections.
    let foundModel;
    Object.values(collections).forEach(collection => {
      let model = collection.findWhere({
        [constants.CUSTOM_URL_PROPERTY_NAME]: splitRoute[0],
      });

      if (model) {
        foundModel = model;
      }
    });

    return foundModel || {};
  }
};

export { getModelFromUrl };
