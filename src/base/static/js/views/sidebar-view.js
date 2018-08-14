var views = {
  ActivityView: require("mapseed-activity-view"),
  AppView: require("mapseed-app-view"),
  BasicLayerView: require("mapseed-basic-layer-view"),
  FilterMenuView: require("mapseed-filter-menu-view"),
  GISLegendView: require("mapseed-gis-legend-view"),
  LayerView: require("mapseed-layer-view"),
  LegendView: require("mapseed-legend-view"),
  MapView: require("mapseed-map-view"),
  SupportView: require("mapseed-support-view"),
};

module.exports = Backbone.View.extend({
  initialize: function() {
    var self = this;
  },

  render: function() {
    var self = this,
      data = {
        config: this.options.sidebarConfig,
      };

    this.$el.html(Handlebars.templates["sidebar"](data));

    this.sidebar = L.control.sidebar("sidebar", {
      position: "left",
    });

    _.each(
      this.options.sidebarConfig.panels,
      function(panelConfig) {
        // TODO: Generalize this for views rendered outside of the sidebar:
        // (or for views with more complicated dependencies like ActivityView)
        if (panelConfig.id != "ticker") {
          new views[panelConfig.view]({
            el: "#" + panelConfig.id,
            mapView: self.options.mapView,
            config: panelConfig,
            sidebar: self.sidebar,
            placeConfig: this.options.placeConfig,
            sidebarView: this,
            panelConfig: panelConfig,
          }).render();
        }
      },
      this,
    );

    self.sidebar.addTo(this.options.mapView);
  },
});
