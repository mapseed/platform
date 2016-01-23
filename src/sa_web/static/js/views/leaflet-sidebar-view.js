
var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.LeafletSidebarView = Backbone.View.extend({
    events: {
      'change .map-legend-checkbox': 'toggleVisibility'
    },
    initialize: function () {
      var self = this;
      this.render();
      self.sidebar = L.control.sidebar('leaflet-sidebar', {
        position: 'left'
      });
      self.sidebar.addTo(this.options.mapView.map);
    },

    render: function() {
      var self = this,
          data = _.extend({
            reports: this.options.reports,
            layers: this.options.layers
          }, S.stickyFieldValues);

      this.$el.html(Handlebars.templates['leaflet-sidebar-content'](data));

      return this;
    },

    // Checkbox change handler, triggers event to the MapView
    toggleVisibility: function(evt) {
      var $cbox = $(evt.target),
        id = $cbox.attr('data-layerid');

      if ($cbox.is(':checked')) {
        $(S).trigger('visibility', [id, true]);
      } else {
        $(S).trigger('visibility', [id, false]);
      }
    }
  });
})(Shareabouts, jQuery, Shareabouts.Util.console);
