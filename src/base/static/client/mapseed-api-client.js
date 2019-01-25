const getDatasets = async datasetUrls => {
  const datasets = [];
  datasetUrls.forEach(url => {
    fetch(url).then(async result => {
      datasets.push(await result.json());
    });
  });

  return datasets;
};

const status = response => {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
};

const json = response => response.json();

const createPlaceTag = ({ placeUrl, tagData, onSuccess, onFailure }) => {
  fetch(`${placeUrl}/tags`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(tagData),
  })
    .then(status)
    .then(json)
    .then(data => onSuccess(data))
    .catch(error => onFailure(error));
};

const updatePlaceTag = ({ placeTag, newData, onSuccess, onFailure }) => {
  fetch(placeTag.url, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    body: JSON.stringify(newData),
  })
    .then(status)
    .then(json)
    .then(data => onSuccess(data))
    .catch(error => onFailure(error));
};

const deletePlaceTag = ({ url, onSuccess, onFailure }) => {
  fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "DELETE",
  })
    .then(status)
    .then(() => onSuccess())
    .catch(error => onFailure(error));
};

const getPlaceCollections = async ({
  placeParams,
  placeCollections,
  layers,
  setLayerError,
  hasAdminAbilities,
}) => {
  const $progressContainer = $("#map-progress");
  const $currentProgress = $("#map-progress .current-progress");
  let pagesComplete = 0;
  let totalPages = 0;
  let pageSize;

  // loop over all place collections
  const placeCollectionPromises = [];
  _.each(placeCollections, function(collection, collectionId) {
    const placeCollectionPromise = new Promise((resolve, reject) => {
      const layer = layers.find(layer => layer.id === collectionId);
      const includePrivate = hasAdminAbilities(collectionId);
      // if we are fetching a dataset id to be used in the dashboard,
      // and the user has access to that dataset:
      collection.fetchAllPages({
        remove: false,
        // Check for a valid location type before adding it to the collection
        validate: true,
        data: includePrivate
          ? { ...placeParams, include_private: true }
          : placeParams,
        // get the dataset slug and id from the array of map layers
        attributesToAdd: {
          datasetSlug: layer.slug,
          datasetId: layer.id,
        },
        attribute: "properties",
        xhrFields: { withCredentials: includePrivate },

        // Only do this for the first page...
        pageSuccess: _.once(function(collection, data) {
          pageSize = data.features.length;
          totalPages = totalPages += Math.ceil(data.metadata.length / pageSize);

          if (data.metadata.next) {
            $progressContainer.show();
          }
        }),

        // Do this for every page...
        pageComplete: function() {
          var percent;

          pagesComplete++;
          percent = (pagesComplete / totalPages) * 100;
          $currentProgress.width(percent + "%");

          if (pagesComplete === totalPages) {
            _.delay(function() {
              $progressContainer.hide();
            }, 2000);
          }
        },

        success: function(fetchedCollection) {
          resolve(fetchedCollection, collectionId);
        },

        error: function(collection, err) {
          layer.is_visible_default && setLayerError(collectionId);
          // eslint-disable-next-line no-console
          console.error(
            `error loading place collection: ${collectionId}: err:`,
            err,
          );
          reject(err);
          // TODO: layer loading event; fix in layer UI PR
        },
      });
    });
    placeCollectionPromises.push(placeCollectionPromise);
  });
  return await Promise.all(placeCollectionPromises);
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

export default {
  place: {
    get: getPlaceCollections,
  },
  activity: {
    get: getActivity,
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
