import constants from "../constants";

const createGeoJSONFromPlaces = places => {
  const features = places.map(place => {
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

const fromGeoJSONFeature = async ({ feature, datasetSlug, clientSlug }) =>
  await {
    geometry: feature.geometry,
    _datasetSlug: datasetSlug,
    _clientSlug: clientSlug,
    ...feature.properties,
  };

// Turn GeoJSON FeatureCollections into plain objects of Place data.
const fromGeoJSONFeatureCollection = async ({
  featureCollection,
  datasetSlug,
  clientSlug,
}) =>
  await featureCollection.features.map(feature => ({
    geometry: feature.geometry,
    // Add a private field for the slug each Place belongs to, so we can
    // filter by dataset when we need to.
    _datasetSlug: datasetSlug,
    _clientSlug: clientSlug,
    ...feature.properties,
  }));

const toGeoJSONFeature = placeData => {
  // We intentionally strip out some keys from the placeData object which
  // should not be sent in the request payload.
  /* eslint-disable no-unused-vars */
  const {
    geometry,
    submitter,
    tags,
    submission_sets,
    attachments,
    _datasetSlug,
    _clientSlug,
    ...rest
  } = placeData;
  /* eslint-enable no-unused-vars */

  return {
    type: "Feature",
    geometry,
    properties: rest,
  };
};

export {
  createGeoJSONFromPlaces,
  fromGeoJSONFeature,
  fromGeoJSONFeatureCollection,
  toGeoJSONFeature,
};
