var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.LegendView = Backbone.View.extend({
    events: {
      'change .map-legend-checkbox': 'toggleVisibility'
    },
    initialize: function () {

      var self = this;
    },

    render: function() {
      var self = this,
          data = _.extend({
            reports: this.options.reports,
            layers: this.options.layers
          }, S.stickyFieldValues)

      this.$el.html(Handlebars.templates['legend'](data));

      return this;
    },

    // Checkbox change handler, triggers event to the MapView
    toggleVisibility: function(evt) {
      var $cbox = $(evt.target),
        id = $cbox.attr('data-layerid');

      if ($cbox.is(':checked')) {
        $(S).trigger('visibility', [id, true]);
        console.log("Adding "+id);
      } else {
        $(S).trigger('visibility', [id, false]);
        console.log("Removing "+id);
      }
    }
  });
})(Shareabouts, jQuery, Shareabouts.Util.console);
