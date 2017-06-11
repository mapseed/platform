var Util = require("../utils.js");

var TemplateHelpers = require("../template-helpers.js");

module.exports = Backbone.View.extend({
  initialize: function() {
    var self = this;
    self.numberOfPlaces = 0;

    _.each(this.options.places, function(collection) {
      self.numberOfPlaces += collection.models.length;

      // Bind data events
      collection.on("reset", self.render, self);
      collection.on("add", self.incrementPlaces, self);
      collection.on("remove", self.decrementPlaces, self);
    });
  },
  incrementPlaces: function() {
    this.numberOfPlaces++;
    this.render();
  },
  decrementPlaces: function() {
    this.numberOfPlaces--;
    this.render();
  },
  render: function() {
    var data = {
      //length: TemplateHelpers.formatNumber(this.collection.models.length),
      meter_config: this.options.mapConfig,
      value: this.numberOfPlaces,
      value_pretty: TemplateHelpers.formatNumber(this.numberOfPlaces),
      counter_max_pretty: TemplateHelpers.formatNumber(
        this.options.mapConfig.counter_max,
      ),
    };
    this.$el.html(Handlebars.templates["count-meter"](data));
    return this;
  },
});
