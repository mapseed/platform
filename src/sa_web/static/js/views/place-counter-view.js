/*globals Backbone */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.PlaceCounterView = Backbone.View.extend({
    initialize: function() {
      var self = this;

      // REFACTOR
      // here and other places below I've hard-coded the places property of the collection object
      self.numberOfPlaces = this.collection.places.models.length;

      // Bind data events
      self.collection.places.on('reset', self.render, self);
      self.collection.places.on('add', self.incrementPlaces, self);
      self.collection.places.on('remove', self.decrementPlaces, self);
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
        length: S.TemplateHelpers.formatNumber(this.collection.places.models.length),
        meter_config: this.options.mapConfig,
        value: this.numberOfPlaces,
        value_pretty: S.TemplateHelpers.formatNumber(this.numberOfPlaces),
        counter_max_pretty: S.TemplateHelpers.formatNumber(this.options.mapConfig.counter_max)
      };
      this.$el.html(Handlebars.templates['count-meter'](data));
      return this;
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));
