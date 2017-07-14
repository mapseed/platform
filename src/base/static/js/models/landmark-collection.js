var LandmarkModel = require("./landmark-model.js");

module.exports = Backbone.Collection.extend({
  model: LandmarkModel,

  // The MapBox GeoJson API returns places under "features".
  // TODO: refactor this by making landmark collection inherit
  // from PaginatedCollection
  parse: function(resp, options) {
    if (options.attributesToAdd) {
      for (var i = 0; i < resp.features.length; i++)
        _.extend(resp.features[i], options.attributesToAdd);
    }
    return resp.features;
  },
});
