const status = response => {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
};

const json = response => response.json();

const getDatasets = async datasetUrls =>
  Promise.all(datasetUrls.map(url => fetch(url).then(json)));

const createPlaceTag = async (url, tagData) => {
  try {
    return await fetch(`${url}/tags`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(tagData),
    })
      .then(status)
      .then(json);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create Place tag.", err);
  }
};

const updatePlaceTag = async (url, newData) => {
  try {
    return await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "PATCH",
      body: JSON.stringify(newData),
    })
      .then(status)
      .then(json);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to update Place tag note.", err);
  }
};

const deletePlaceTag = async url => {
  try {
    return await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "DELETE",
    }).then(status);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to delete Place tag.", err);
  }
};

const buildQuerystring = params =>
  Object.entries(params).reduce((querystring, [param, value]) => {
    return `${querystring}&${param}=${value}`;
  }, "?");

const fromGeoJSONFeatureCollection = ({
  featureCollection,
  datasetSlug,
  clientSlug,
}) =>
  Promise.resolve(
    featureCollection.features.map(feature => ({
      geometry: feature.geometry,
      // Add a private field for the slug each Place belongs to, so we can
      // filter by dataset when we need to.
      _datasetSlug: datasetSlug,
      _clientSlug: clientSlug,
      ...feature.properties,
    })),
  );

const fromGeoJSONFeature = (feature, datasetSlug) =>
  Promise.resolve({
    geometry: feature.geometry,
    _datasetSlug: datasetSlug,
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

// Get all the places for a single dataset
const getPlaces = async ({
  url,
  placeParams,
  includePrivate,
  datasetSlug,
  clientSlug,
}) => {
  try {
    const placePagePromises = [];
    placeParams = includePrivate
      ? {
          ...placeParams,
          include_private_places: true,
          include_private_fields: true,
        }
      : placeParams;

    const firstPagePromise = fetch(`${url}${buildQuerystring(placeParams)}`, {
      credentials: "include",
    })
      .then(status)
      .then(json);

    placePagePromises.push(firstPagePromise);

    await firstPagePromise.then(data => {
      // Fetch additional pages of data, if they exist.
      if (data.metadata.next) {
        const pageSize = data.features.length;
        const totalPages =
          pageSize > 0 ? Math.ceil(data.metadata.length / pageSize) : 0;

        for (let i = 2; i <= totalPages; i++) {
          placeParams = { ...placeParams, page: i };
          placePagePromises.push(
            fetch(`${url}${buildQuerystring(placeParams)}`, {
              credentials: "include",
            })
              .then(status)
              .then(json),
          );
        }
      }
    });

    return placePagePromises.map(placePagePromise =>
      // Convert from GeoJSON to a simple object of Place data.
      placePagePromise.then(featureCollection =>
        fromGeoJSONFeatureCollection({
          featureCollection,
          datasetSlug,
          clientSlug,
        }),
      ),
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to fetch places.", err);
  }
};

// TODO: include_private_places and include_private_fields ??
const updatePlace = async (placeUrl, placeData) => {
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
      .then(json);
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
      .then(featureCollection =>
        fromGeoJSONFeature({ featureCollection, datasetSlug, clientSlug }),
      );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create Place.", err);
  }
};

const getActivity = async (datasetUrl, clientSlug) => {
  try {
    return await fetch(`${datasetUrl}/actions`, {
      credentials: "include",
    })
      .then(status)
      .then(json)
      .then(response => {
        return Promise.resolve(
          // Note that activity is returned from the API in paginated form.
          // Here we load just the first page, assuming only the most
          // recent page of activity is useful to the user.
          response.results.map(activity => ({
            ...activity,
            // Add the "client slug" to be used with activity from this dataset.
            // The client slug is used in urls in the client.
            _clientSlug: clientSlug,
          })),
        );
      });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to fetch actions.", err);
  }
};

const createSupport = async (placeUrl, supportData) => {
  try {
    return await fetch(`${placeUrl}/support`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(supportData),
    })
      .then(status)
      .then(json);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create support.", err);
  }
};

const deleteSupport = async (placeUrl, supportId) => {
  try {
    return await fetch(`${placeUrl}/support/${supportId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "DELETE",
    }).then(status);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to delete support.", err);
  }
};

const createComment = async (placeUrl, commentData) => {
  try {
    return await fetch(`${placeUrl}/comments`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(commentData),
    })
      .then(status)
      .then(json);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create comment.", err);
  }
};

const updateComment = async ({ placeUrl, commentId, commentData }) => {
  try {
    return await fetch(`${placeUrl}/comments/${commentId}?include_invisible`, {
      headers: {
        "Content-Type": "application/json",
        "X-Shareabouts-Silent": true, // To prevent new Actions on update.
      },
      credentials: "include",
      method: "PUT",
      body: JSON.stringify(commentData),
    })
      .then(status)
      .then(json);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to update comment.", err);
  }
};

const createAttachments = async (placeUrl, attachments) => {
  try {
    const attachmentPromises = [];
    attachments.forEach(attachment => {
      const formData = new FormData();
      if (attachment.blob) {
        formData.append("file", attachment.blob);
      }
      formData.append("name", attachment.name);
      formData.append("type", attachment.type);
      formData.append("visible", true);

      attachmentPromises.push(
        fetch(`${placeUrl}/attachments`, {
          credentials: "include",
          method: "POST",
          body: formData,
        })
          .then(status)
          .then(json),
      );
    });

    return attachmentPromises;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to create attachments.", err);
  }
};

const deleteAttachment = async (placeUrl, attachmentId) => {
  try {
    return await fetch(`${placeUrl}/attachments/${attachmentId}`, {
      credentials: "include",
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        visible: false,
      }),
    }).then(status);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to delete attachment.", err);
  }
};

export default {
  place: {
    get: getPlaces,
    create: createPlace,
    update: updatePlace,
  },
  activity: {
    get: getActivity,
  },
  support: {
    create: createSupport,
    delete: deleteSupport,
  },
  comments: {
    create: createComment,
    update: updateComment,
  },
  datasets: {
    get: getDatasets,
  },
  placeTags: {
    create: createPlaceTag,
    update: updatePlaceTag,
    delete: deletePlaceTag,
  },
  attachments: {
    create: createAttachments,
    delete: deleteAttachment,
  },
  utils: {
    fromGeoJSONFeature: fromGeoJSONFeature,
  },
};
