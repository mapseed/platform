var PlaceModel = require('./place-model.js');
var LandmarkModel = require('./landmark-model.js');

module.exports = Backbone.Collection.extend({
  // NOTE: story collections might contain place models,
  // landmark models, or both
  model: function(model, options) {
    switch(model.type) {
      case "landmark":
        return new LandmarkModel(model, options);
        break;
      case "place":
        return new PlaceModel(model, options);
        break;
    }
  }
});