import qs from "qs";

import {
  fromGeoJSONFeature,
  fromGeoJSONFeatureCollection,
  toServerGeoJSONFeature,
} from "../../utils/place-utils";

const setPrivateParams = (placeParams, includePrivate) =>
  includePrivate
    ? {
        ...placeParams,
        include_private_places: true,
        include_private_fields: true,
      }
    : placeParams;

const updatePlace = async ({
  placeUrl,
  placeData,
  datasetSlug,
  clientSlug,
}) => {
  placeData = toServerGeoJSONFeature(placeData);
  // TODO: Private query params.
  // See: https://github.com/jalMogo/mgmt/issues/241
  const placeParams = {
    include_tags: true,
    include_submissions: true,
  };

  const response = await fetch(`${placeUrl}?${qs.stringify(placeParams)}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Shareabouts-Silent": true, // To prevent new Actions on update.
    },
    // Note that we do *not* include credentials with PUT requests to a
    // place endpoint. Sending credentials will cause the submitter of
    // the Place to be updated to the submitter of the PUT request, even if
    // the submitter object is stripped out of the request payload.
    // See: https://github.com/jalMogo/mgmt/issues/227
    method: "PUT",
    body: JSON.stringify(placeData),
  });

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to update Place.", response.statusText);

    return null;
  }

  const feature = await response.json();

  return fromGeoJSONFeature({ feature, datasetSlug, clientSlug });
};

const createPlace = async ({
  datasetUrl,
  placeData,
  datasetSlug,
  clientSlug,
  includePrivate = false,
}) => {
  placeData = toServerGeoJSONFeature(placeData);

  const placeParams = setPrivateParams(
    {
      include_tags: true,
      include_submissions: true,
    },
    includePrivate,
  );
  const response = await fetch(
    `${datasetUrl}/places?${qs.stringify(placeParams)}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(placeData),
    },
  );

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create Place.", response.statusText);

    return null;
  }

  const feature = await response.json();

  if (feature.isOfflineResponse) {
    // create a place model to serve as a dummy place until we get back online:
    // TODO: find a better way to ensure this schema is in sync with the response from our server:
    return {
      updated_datetime: "2019-02-21T19:16:33.481363+00:00",
      created_datetime: "2019-02-21T19:16:33.481363+00:00",
      url: "https://offline.mapseed.org/",
      submitter_name: "offline",
      datasetSlug,
      datasetId: datasetSlug,
      submitter: null,
      visible: true,
      submission_sets: {},
      attachments: [],
      tags: [],
      id: 99999,
      type: "place",
      ...fromGeoJSONFeature({ feature: placeData, datasetSlug, clientSlug }),
      isOfflineResponse: true,
    };
  }

  return fromGeoJSONFeature({ feature, datasetSlug, clientSlug });
};

const getPlaces = async ({
  url,
  placeParams,
  includePrivate,
  datasetSlug,
  clientSlug,
}) => {
  placeParams = setPrivateParams(placeParams, includePrivate);

  const response = await fetch(`${url}?${qs.stringify(placeParams)}`, {
    credentials: "include",
  });

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to fetch place page.", response.statusText);

    return null;
  }

  const firstPage = await response.json();
  const placePagePromises = [];

  // Fetch additional pages of data, if they exist.
  if (firstPage.metadata.next) {
    const pageSize = firstPage.features.length;
    const totalPages =
      pageSize > 0 ? Math.ceil(firstPage.metadata.length / pageSize) : 0;

    for (let i = 2; i <= totalPages; i++) {
      placeParams = { ...placeParams, page: i };
      placePagePromises.push(
        fetch(`${url}?${qs.stringify(placeParams)}`, {
          credentials: "include",
        })
          .then(response => {
            if (response.status < 200 || response.status >= 300) {
              return Promise.reject(response.statusText);
            }

            return Promise.resolve(response);
          })
          .then(data => data.json())
          .then(featureCollection =>
            fromGeoJSONFeatureCollection({
              featureCollection,
              datasetSlug,
              clientSlug,
            }),
          )
          .catch(err => {
            // eslint-disable-next-line no-console
            console.error("Error: Failed to fetch place page.", err);
          }),
      );
    }
  }

  // Promisfy the first page and add it to the array of returned Promises.
  placePagePromises.push(
    Promise.resolve(
      fromGeoJSONFeatureCollection({
        featureCollection: firstPage,
        datasetSlug,
        clientSlug,
      }),
    ),
  );

  // Note that this method returns an array of Promises, each of which will
  // resolve to a page of Place data transformed from GeoJSON. We return
  // these Promises so the calling code can act on pages of data as they
  // resolve one by one.
  return placePagePromises;
};

export default {
  get: getPlaces,
  create: createPlace,
  update: updatePlace,
};
