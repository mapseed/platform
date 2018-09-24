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

const buildGeoJSONPropertiesFromAttrs = model =>
  Object.keys(model.attributes).reduce((geoJSONProperties, property) => {
    geoJSONProperties[property] = model.get(property);
    return geoJSONProperties;
  }, {});

const createGeoJSONFromCollection = ({
  collection,
  modelIdToFocus,
  modelIdToHide,
}) => {
  const regularFeatures = collection
    .filter(
      model =>
        model.get(constants.MODEL_ID_PROPERTY_NAME) !== modelIdToHide &&
        model.get(constants.MODEL_ID_PROPERTY_NAME) !== modelIdToFocus,
    )
    .map(model => ({
      type: "Feature",
      properties: buildGeoJSONPropertiesFromAttrs(model),
      geometry: model.get(constants.GEOMETRY_PROPERTY_NAME),
    }));

  // To focus a feature in a layer, we first remove it from the origin layer
  // above, then add it to a separate focused layer. That way we can control
  // the focused layer independently of the source layer and ensure focused
  // features always render above all other features.
  // TODO: Support multiple focused features simultaneously.
  const focusedFeature = collection
    .filter(
      model => model.get(constants.MODEL_ID_PROPERTY_NAME) === modelIdToFocus,
    )
    .map(model => ({
      type: "Feature",
      properties: buildGeoJSONPropertiesFromAttrs(model),
      geometry: model.get(constants.GEOMETRY_PROPERTY_NAME),
    }));

  return {
    regularFeatures: {
      type: "FeatureCollection",
      features: regularFeatures,
    },
    focusedFeatures: {
      type: "FeatureCollection",
      features: focusedFeature,
    },
  };
};

export { getModelFromUrl, createGeoJSONFromCollection };
