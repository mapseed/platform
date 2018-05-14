const getPlaceCollections = async ({
  placeParams,
  placeCollections,
  mapView,
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
  _.each(placeCollections, function(collection, key) {
    mapView.map.fire("layer:loading", { id: key });
    const placeCollectionPromise = collection.fetchAllPages({
      remove: false,
      // Check for a valid location type before adding it to the collection
      validate: true,
      data: placeParams,
      // get the dataset slug and id from the array of map layers
      attributesToAdd: {
        datasetSlug: _.find(mapConfig.layers, function(layer) {
          return layer.id == key;
        }).slug,
        datasetId: _.find(mapConfig.layers, function(layer) {
          return layer.id == key;
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
        percent = pagesComplete / totalPages * 100;
        $currentProgress.width(percent + "%");

        if (pagesComplete === totalPages) {
          _.delay(function() {
            $progressContainer.hide();
          }, 2000);
        }
      },

      success: function() {
        mapView.map.fire("layer:loaded", { id: key });
      },

      error: function() {
        mapView.map.fire("layer:error", { id: key });
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
