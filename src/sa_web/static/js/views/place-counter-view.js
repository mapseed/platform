/*globals Backbone */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.PlaceCounterView = Backbone.View.extend({
    initialize: function() {
      var self = this;

      self.numberOfPlaces = this.collection.models.length;

      // Bind data events
      self.collection.on('reset', self.render, self);
      self.collection.on('add', self.incrementPlaces, self);
      self.collection.on('remove', self.decrementPlaces, self);
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
        length: this.collection.models.length,
        meter_config: this.options.mapConfig,
        value: this.numberOfPlaces
      };
      this.$el.html(Handlebars.templates['count-meter'](data));
      return this;
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));
