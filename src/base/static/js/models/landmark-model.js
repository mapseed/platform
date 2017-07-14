var ModelUtils = require("./model-utils.js");

// This model is based off the Mapbox Classic API
module.exports = Backbone.Model.extend({
  defaults: {
    type: "landmark",
  },
  initialize: function() {
    this.set("id", this.get("title"));
  },
  parse: function(response) {
    var response = _.clone(response);
    // add story object, if relevant
    _.extend(response, ModelUtils.addStoryObj(response, "landmark"));
    _.extend(response, ModelUtils.addLandmarkDescription(response.properties));

    return response;
  },
});
