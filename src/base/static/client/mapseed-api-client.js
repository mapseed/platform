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
    console.error("Error: Failed to create tag.", err);
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
    console.error("Error: Tag note did note save.", err);
  }
};

const deletePlaceTag = async url => {
  try {
    await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "DELETE",
    }).then(status);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to delete tag.", err);
  }
};

const buildQuerystring = params =>
  Object.entries(params).reduce((querystring, [param, value]) => {
    return `${querystring}&${param}=${value}`;
  }, "?");

const fromGeoJSON = (featureCollection, datasetSlug) =>
  Promise.resolve(
    featureCollection.features.map(feature => ({
      geometry: feature.geometry,
      // Add a private field for the slug each Place belongs to, so we can
      // filter by dataset when we need to.
      _datasetSlug: datasetSlug,
      ...feature.properties,
    })),
  );

// Get all the places for a single dataset
const getPlaces = async ({ url, placeParams, includePrivate, datasetSlug }) => {
  try {
    const placePagePromises = [];
    placeParams = includePrivate
      ? { ...placeParams, include_private: true }
      : placeParams;

    const firstPagePromise = fetch(`${url}${buildQuerystring(placeParams)}`)
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
            fetch(`${url}${buildQuerystring(placeParams)}`)
              .then(status)
              .then(json),
          );
        }
      }
    });

    return placePagePromises.map(placePagePromise =>
      // Convert from GeoJSON to a simple object of Place data.
      placePagePromise.then(data => fromGeoJSON(data, datasetSlug)),
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to fetch places.", err);
  }
};

const getActivity = activityCollections => {
  activityCollections.forEach(([activityCollection, successCallback]) => {
    activityCollection.fetch({
      success: successCallback,
      error: (collection, error) => {
        // eslint-disable-next-line no-console
        console.error("Error fetching activity collection", error);
      },
    });
  });
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
}

const deleteComment = async (placeUrl, commentId) => {
  try {
    return await fetch(`${placeUrl}/comments/${commentId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "DELETE",
    }).then(status);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error: Failed to delete comment.", err);
  }
};

export default {
  place: {
    get: getPlaces,
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
    delete: deleteComment,
  },
  datasets: {
    get: getDatasets,
  },
  placeTags: {
    create: createPlaceTag,
    update: updatePlaceTag,
    delete: deletePlaceTag,
  },
};
