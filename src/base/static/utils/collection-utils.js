import constants from "../constants";

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

export { createGeoJSONFromCollection };
