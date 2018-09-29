import constants from "../constants";

// Given a route and a POJO of Backbone collections, return the model that
// matches the route if it exists.
const getModelFromUrl = ({ collections, route, mapConfig }) => {
  const splitRoute = route.split("/");
  const layerConfig = mapConfig.layers.find(
    config => config.slug === splitRoute[0],
  );

  if (layerConfig) {
    return collections[layerConfig.id].get(splitRoute[1]);
  }
};

const createGeoJSONFromCollection = collection => {
  const features = collection.map(model => {
    const properties = Object.keys(model.attributes).reduce(
      (geoJSONProperties, property) => {
        geoJSONProperties[property] = model.get(property);
        return geoJSONProperties;
      },
      {},
    );

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
