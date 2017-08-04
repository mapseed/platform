var views = {
  ActivityView: require("mapseed-activity-view"),
  AppView: require("mapseed-app-view"),
  AuthNavView: require("mapseed-auth-nav-view"),
  BasicLayerView: require("mapseed-basic-layer-view"),
  GeocodeAddressPlaceView: require("mapseed-geocode-address-place-view"),
  GeocodeAddressView: require("mapseed-geocode-address-view"),
  GISLegendView: require("mapseed-gis-legend-view"),
  LandmarkDetailView: require("mapseed-landmark-detail-view"),
  LandmarkSurveyView: require("mapseed-landmark-survey-view"),
  LayerView: require("mapseed-layer-view"),
  LegendView: require("mapseed-legend-view"),
  MapView: require("mapseed-map-view"),
  PagesNavView: require("mapseed-pages-nav-view"),
  PlaceCounterView: require("mapseed-place-counter-view"),
  PlaceDetailView: require("mapseed-place-detail-view"),
  PlaceFormView: require("mapseed-place-form-view"),
  PlaceListView: require("mapseed-place-list-view"),
  SupportView: require("mapseed-support-view"),
  SurveyView: require("mapseed-survey-view"),
};

var SidebarView = require("../../../../../base/static/js/views/sidebar-view.js");

module.exports = SidebarView.extend({
  render: function() {
    // build a config object without the legend box, so
    // it will not render in the leaflet sidebar
    var configNoLegend = {};
    _.extend(configNoLegend, this.options.sidebarConfig);
    configNoLegend.panels = _.filter(configNoLegend.panels, function(panel) {
      return panel.id !== "right-sidebar-container";
    });

    var self = this,
      data = {
        config: configNoLegend,
      };

    this.$el.html(Handlebars.templates["sidebar"](data));

    _.each(this.options.sidebarConfig.panels, function(panelConfig) {
      // TODO: Generalize this for views rendered outside of the sidebar:
      // (or for views with more complicated dependencies like ActivityView)
      if (panelConfig.id != "ticker") {
        new views[panelConfig.view]({
          el: "#" + panelConfig.id,
          mapView: self.options.mapView,
          config: panelConfig,
          sidebar: self.sidebar,
          placeConfig: self.options.placeConfig,
          sidebarView: self
        }).render();
      }
    });

    self.sidebar = L.control.sidebar("sidebar", {
      position: "left",
    });
    self.sidebar.addTo(this.options.mapView);
  },
});
