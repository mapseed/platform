import activityClient from "./activity";
import attachmentsClient from "./attachments";
import commentsClient from "./comments";
import datasetsClient from "./datasets";
import placeClient from "./place";
import placeTagsClient from "./place-tags";
import supportClient from "./support";

export default {
  activity: activityClient,
  attachments: attachmentsClient,
  comments: commentsClient,
  datasets: datasetsClient,
  place: placeClient,
  placeTags: placeTagsClient,
  support: supportClient,
};



const fromGeoJSONFeature = ({ feature, datasetSlug, clientSlug }) =>
  Promise.resolve({
    geometry: feature.geometry,
    _datasetSlug: datasetSlug,
    _clientSlug: clientSlug,
    ...feature.properties,
  });

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


// TODO: include_private_places and include_private_fields ??
const updatePlace = async ({
  placeUrl,
  placeData,
  datasetSlug,
  clientSlug,
}) => {
  try {
    placeData = toGeoJSONFeature(placeData);
    return await fetch(
      `${placeUrl}${buildQuerystring({
        include_tags: true,
        include_submissions: true,
      })}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shareabouts-Silent": true, // To prevent new Actions on update.
        },
        credentials: "include",
        method: "PUT",
        body: JSON.stringify(placeData),
      },
    )
      .then(status)
      .then(json)
      .then(feature =>
        fromGeoJSONFeature({ feature, datasetSlug, clientSlug }),
      );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to update Place.", err);
  }
};

const createPlace = async ({
  datasetUrl,
  placeData,
  datasetSlug,
  clientSlug,
}) => {
  try {
    placeData = toGeoJSONFeature(placeData);
    return await fetch(`${datasetUrl}/places?include_tags`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(placeData),
    })
      .then(status)
      .then(json)
      .then(feature =>
        fromGeoJSONFeature({ feature, datasetSlug, clientSlug }),
      );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create Place.", err);
  }
};



