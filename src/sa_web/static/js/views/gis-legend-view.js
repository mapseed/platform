// leaflet-sidebar-view: GIS: needs layers, not reports
var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.GISLegendView = Backbone.View.extend({
    events: {
      'change .map-legend-checkbox': 'toggleVisibility',
      'change .map-legend-grouping-checkbox': 'toggleHeaderVisibility'
    },

    initialize: function () {
      var self = this;
      this.render();
      self.sidebar = L.control.sidebar('sidebar', {
        position: 'left'
      });
      self.sidebar.addTo(this.options.mapView.map);
    },

    render: function() {
      var self = this,
          data = _.extend({
            groupings: this.options.groupings
          }, S.stickyFieldValues);

      this.$el.html(Handlebars.templates['gis-legend-content'](data));

      return this;
    },

    // Checkbox change handler, triggers event to the MapView
    toggleVisibility: function(evt) {
      var $cbox = $(evt.target),
          id = $cbox.attr('data-layerid'),
          isChecked = !!$cbox.is(':checked');

      $(S).trigger('visibility', [id, isChecked]);
    },

    // Toggles visibility of layers based on header checkbox
    toggleHeaderVisibility: function(evt) {
      var $groupbox = $(evt.target),
           groupid = $groupbox.attr("id"),
           isChecked = $groupbox.is(":checked"),
           group = _.find(this.options.groupings, function(group) {
                     return group.id === groupid;
                   });

      for (i = 0; i < group.layers.length; i++) {
        var layer = group.layers[i];
        $(S).trigger("visibility", [layer.id, isChecked]);
        $("#map-" + layer.id).prop("checked", isChecked);
      }
    }

  });
})(Shareabouts, jQuery, Shareabouts.Util.console);
