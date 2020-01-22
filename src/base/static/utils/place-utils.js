import {
  ListSubmittedField,
  TextSubmittedField,
  RichTextSubmittedField,
  NumberSubmiittedField,
} from "../components/atoms/typography";
import constants from "../constants";

const getSubmittedFieldComponent = (type, variant) => {
  if (type === "radiofield" || type === "checkboxfield") {
    return ListSubmittedField;
  } else if (type === "richtext") {
    return RichTextSubmittedField;
  } else {
    return TextSubmittedField;
  }
};

const FIELDS = [
  "textfield",
  "addressfield",
  "radiofield",
  "checkboxfield",
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

const fromGeoJSONFeature = feature => ({
  ...feature.properties,
  geometry: feature.geometry,
});

// Turn GeoJSON FeatureCollections into plain objects of Place data.
const fromGeoJSONFeatureCollection = featureCollection =>
  featureCollection.features.map(feature => ({
    ...feature.properties,
    geometry: feature.geometry,
  }));

const toClientGeoJSONFeature = placeData => {
  const { geometry, ...rest } = placeData;

  return {
    type: "Feature",
    geometry,
    properties: rest,
  };
};

const toGeoJSONFeature = placeData => {
  // We intentionally strip out some keys from the placeData object which
  // should not be sent to the server in the request payload.
  const {
    geometry,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    /* eslint-disable no-unused-vars */
    submitter,
    tags,
    // eslint-disable-next-line @typescript-eslint/camelcase
    submission_sets,
    attachments,
    mapseedConfiguration,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    /* eslint-enable no-unused-vars */
    ...rest
  } = placeData;

  return {
    type: "Feature",
    geometry,
    properties: rest,
  };
};

export {
  getSubmittedFieldComponent,
  isFormField,
  createGeoJSONFromPlaces,
  fromGeoJSONFeature,
  fromGeoJSONFeatureCollection,
  setPrivateParams,
  toGeoJSONFeature,
  toClientGeoJSONFeature,
};
