/*globals Backbone */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.PlaceCounterView = Backbone.View.extend({
    render: function() {
      var data = {
        length: this.collection.models.length,
        meter_config: this.options.mapConfig,
        value: 2145
      };
      this.$el.html(Handlebars.templates['count-meter'](data));
      return this;
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));
