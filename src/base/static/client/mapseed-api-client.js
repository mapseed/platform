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
          ? {
              ...placeParams,
              include_private_places: true,
              include_private_fields: true,
            }
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

        success: function(fetchedCollection, response, options) {
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
};
