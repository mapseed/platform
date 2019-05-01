import constants from "../constants";

const setPrivateParams = (placeParams, includePrivate) =>
  includePrivate
    ? {
        ...placeParams,
        include_private_places: true,
        include_private_fields: true,
      }
    : placeParams;

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

const fromGeoJSONFeature = ({ feature, datasetSlug, clientSlug }) => ({
  geometry: feature.geometry,
  datasetSlug,
  clientSlug,
  ...feature.properties,
});

// Turn GeoJSON FeatureCollections into plain objects of Place data.
const fromGeoJSONFeatureCollection = ({
  featureCollection,
  datasetSlug,
  clientSlug,
}) =>
  featureCollection.features.map(feature => ({
    geometry: feature.geometry,
    // Add a field for the slug each Place belongs to, so we can
    // filter by dataset when we need to.
    datasetSlug,
    clientSlug,
    ...feature.properties,
  }));

const toClientGeoJSONFeature = placeData => {
  const { geometry, ...rest } = placeData;

  return {
    type: "Feature",
    geometry,
    properties: rest,
  };
};

const toServerGeoJSONFeature = placeData => {
  // We intentionally strip out some keys from the placeData object which
  // should not be sent to the server in the request payload.
  const {
    geometry,
    submitter,
    tags,
    submission_sets,
    attachments,
    datasetSlug,
    clientSlug,
    ...rest
  } = placeData;

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
  setPrivateParams,
  toServerGeoJSONFeature,
  toClientGeoJSONFeature,
};
