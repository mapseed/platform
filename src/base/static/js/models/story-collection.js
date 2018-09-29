var PlaceModel = require("./place-model.js");

module.exports = Backbone.Collection.extend({
  model: function(model, options) {
    return new PlaceModel(model, options);
  },
});
