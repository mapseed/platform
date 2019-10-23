import constants from "../constants";

const FIELDS = [
  "textfield",
  "addressfield",
  "radiofield",
  "textareafield",
  "numberfield",
  "datefield",
];

const isFormField = moduleType => FIELDS.includes(moduleType);

const setPrivateParams = (placeParams, includePrivate, jwtToken = null) => {
  if (jwtToken) {
    placeParams = {
      ...placeParams,
      token: jwtToken,
    };
  }

  return includePrivate
    ? {
        ...placeParams,
        include_private_places: true,
        include_private_fields: true,
      }
    : placeParams;
};

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
  ...feature.properties,
  geometry: feature.geometry,
  datasetSlug,
  clientSlug,
});

// Turn GeoJSON FeatureCollections into plain objects of Place data.
const fromGeoJSONFeatureCollection = ({
  featureCollection,
  datasetSlug,
  clientSlug,
}) =>
  featureCollection.features.map(feature => ({
    ...feature.properties,
    geometry: feature.geometry,
    // Add a field for the slug each Place belongs to, so we can
    // filter by dataset when we need to.
    datasetSlug,
    clientSlug,
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
  isFormField,
  createGeoJSONFromPlaces,
  fromGeoJSONFeature,
  fromGeoJSONFeatureCollection,
  setPrivateParams,
  toServerGeoJSONFeature,
  toClientGeoJSONFeature,
};
