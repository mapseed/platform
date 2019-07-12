import qs from "qs";
import { setPrivateParams } from "../../utils/place-utils";

import {
  fromGeoJSONFeature,
  fromGeoJSONFeatureCollection,
  toServerGeoJSONFeature,
} from "../../utils/place-utils";

const updatePlace = async ({
  placeUrl,
  placeData,
  datasetSlug,
  clientSlug,
  hasAdminAbilities = false,
}) => {
  placeData = toServerGeoJSONFeature(placeData);
  const placeParams = setPrivateParams(
    {
      include_tags: true,
      include_submissions: true,
    },
    hasAdminAbilities,
  );

  const response = await fetch(`${placeUrl}?${qs.stringify(placeParams)}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Shareabouts-Silent": true, // To prevent new Actions on update.
    },
    method: "PUT",
    credentials: "include",
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
    // Let the caller know that an offline place was submitted:
    return {
      isOffline: true,
    };
  }

  return fromGeoJSONFeature({ feature, datasetSlug, clientSlug });
};

const getPlace = async ({
  datasetUrl,
  placeParams,
  includePrivate = false,
  placeId,
  datasetSlug,
  clientSlug,
  jwtToken,
}) => {
  placeParams = setPrivateParams(placeParams, includePrivate, jwtToken);

  const response = await fetch(
    `${datasetUrl}/places/${placeId}?${qs.stringify(placeParams)}`,
    { credentials: "include" },
  );

  if (response.status < 200 || response.status >= 300) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to fetch place.", response.statusText);

    return null;
  }

  const feature = await response.json();

  return fromGeoJSONFeature({
    feature,
    datasetSlug,
    clientSlug,
  });
};

const getAllPlaces = async ({
  datasetUrl,
  placeParams,
  includePrivate = false,
  datasetSlug,
  clientSlug,
}) => {
  placeParams = setPrivateParams(placeParams, includePrivate);

  const response = await fetch(
    `${datasetUrl}/places?${qs.stringify(placeParams)}`,
    {
      credentials: "include",
    },
  );

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
        fetch(`${datasetUrl}/places?${qs.stringify(placeParams)}`, {
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
  get: getAllPlaces,
  getPlace: getPlace,
  create: createPlace,
  update: updatePlace,
};
