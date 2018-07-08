import emitter from "../utils/emitter";

const getPlaceCollections = async ({
  placeParams,
  placeCollections,
  mapConfig,
}) => {
  const $progressContainer = $("#map-progress");
  const $currentProgress = $("#map-progress .current-progress");
  let totalPages;
  let pagesComplete = 0;
  let pageSize;

  // TODO(luke): Once backbone models are ported into the redux store,
  // mapseedApiClient will handle the logic for handling the responses
  // from the api directly.

  // loop over all place collections
  const placeCollectionPromises = [];
  _.each(placeCollections, function(collection, collectionId) {
    // TODO: layer loading event; fix in layer UI PR
    const placeCollectionPromise = collection.fetchAllPages({
      remove: false,
      // Check for a valid location type before adding it to the collection
      validate: true,
      data: placeParams,
      // get the dataset slug and id from the array of map layers
      attributesToAdd: {
        datasetSlug: _.find(mapConfig.layers, function(layer) {
          return layer.id == collectionId;
        }).slug,
        datasetId: _.find(mapConfig.layers, function(layer) {
          return layer.id == collectionId;
        }).id,
      },
      attribute: "properties",

      // Only do this for the first page...
      pageSuccess: _.once(function(collection, data) {
        pageSize = data.features.length;
        totalPages = Math.ceil(data.metadata.length / pageSize);

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

      success: function() {
        emitter.emit("place-collection:loaded", collectionId);
        // TODO: layer loading event; fix in layer UI PR
      },

      error: function() {
        // TODO: layer loading event; fix in layer UI PR
      },
    });
    placeCollectionPromises.push(placeCollectionPromise);
  });
  return await Promise.all(placeCollectionPromises);
};

export default {
  place: {
    get: getPlaceCollections,
  },
};
