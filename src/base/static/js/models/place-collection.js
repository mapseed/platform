var PlaceModel = require("./place-model.js");
var PaginatedCollection = require("./paginated-collection.js");

module.exports = PaginatedCollection.extend({
  url: "/api/places",
  model: PlaceModel,
  resultsAttr: "features",

  fetchByIds: function(ids, options) {
    var base = _.result(this, "url");

    if (ids.length === 1) {
      this.fetchById(ids[0], options);
    } else {
      ids = _.map(ids, function(id) {
        return encodeURIComponent(id);
      });
      options = options ? _.clone(options) : {};
      options.url =
        base +
        (base.charAt(base.length - 1) === "/" ? "" : "/") +
        ids.join(",");

      this.fetch(_.extend({ remove: false }, options));
    }
  },

  fetchById: function(id, options) {
    options = options ? _.clone(options) : {};
    var self = this,
      place = new PlaceModel(),
      success = options.success;

    place.id = id;
    place.collection = self;

    options.success = function() {
      var args = Array.prototype.slice.call(arguments);
      self.add(place);
      if (success) {
        success.apply(this, args);
      }
    };
    place.fetch(options);
  },
});
