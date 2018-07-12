import constants from "../constants";

// Given a route and a POJO of Backbone collections, return the model that
// matches the route if it exists.
const getModelFromUrl = ({ collections, route, mapConfig }) => {
  // ie: "myStory/123"
  const splitRoute = route.split("/");

  // If the url has a slash in it with text on either side, we assume we have
  // a place model url and can look up the model directly.
  if (splitRoute.length === 2) {
    const layerConfig = mapConfig.layers.find(
      config => config.slug === splitRoute[0],
    );

    if (layerConfig) {
      return collections[layerConfig.id].get(splitRoute[1]);
    }
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

    return foundModel;
  }
};

const createGeoJSONFromCollection = ({
  collection,
  modelIdToFocus,
  modelIdToHide,
}) => {
  const features = collection.map(model => {
    const properties = Object.keys(model.attributes)
      .filter(key => key !== constants.GEOMETRY_PROPERTY_NAME)
      .reduce((geoJSONProperties, property) => {
        geoJSONProperties[property] = model.get(property);
        return geoJSONProperties;
      }, {});

    if (modelIdToHide === properties.id) {
      return [];
    }

    properties[constants.IS_FOCUSED_PROPERTY_NAME] =
      modelIdToFocus === properties.id;

    return {
      type: "Feature",
      properties: properties,
      geometry: model.get(constants.GEOMETRY_PROPERTY_NAME),
    };
  });

  return {
    type: "FeatureCollection",
    features: features,
  };
};

export { getModelFromUrl, createGeoJSONFromCollection };
