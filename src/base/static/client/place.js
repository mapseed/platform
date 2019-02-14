import qs from "qs";

import {
  fromGeoJSONFeature,
  fromGeoJSONFeatureCollection,
  toGeoJSONFeature,
} from "../utils/place-utils";

const status = response => {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
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
    const response = await fetch(
      `${placeUrl}?${qs.stringify({
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
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }

    const feature = await response.json();

    return fromGeoJSONFeature({ feature, datasetSlug, clientSlug });
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

    const response = await fetch(`${datasetUrl}/places?include_tags`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(placeData),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }

    const feature = await response.json();

    return fromGeoJSONFeature({ feature, datasetSlug, clientSlug });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create Place.", err);
  }
};

const getPlaces = async ({
  url,
  placeParams,
  includePrivate,
  datasetSlug,
  clientSlug,
}) => {
  try {
    placeParams = includePrivate
      ? {
          ...placeParams,
          include_private_places: true,
          include_private_fields: true,
        }
      : placeParams;

    const response = await fetch(`${url}?${qs.stringify(placeParams)}`, {
      credentials: "include",
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
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
            .then(status)
            .then(data => data.json())
            .then(featureCollection =>
              fromGeoJSONFeatureCollection({
                featureCollection,
                datasetSlug,
                clientSlug,
              }),
            ),
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
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to fetch places.", err);
  }
};

export default {
  get: getPlaces,
  create: createPlace,
  update: updatePlace,
};
