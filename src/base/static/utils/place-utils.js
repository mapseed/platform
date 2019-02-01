import constants from "../constants";

const createGeoJSONFromPlaces = places => {
  const features = places.filter(place => !place.private).map(place => {
    const properties = Object.keys(place).reduce(
      (geoJSONProperties, property) => {
        geoJSONProperties[property] = place[property];
        return geoJSONProperties;
      },
      {},
    );

    return {
      type: "Feature",
      properties: properties,
      geometry: place[constants.GEOMETRY_PROPERTY_NAME],
    };
  });

  return {
    type: "FeatureCollection",
    features: features,
  };
};

export { createGeoJSONFromPlaces };
