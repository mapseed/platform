const SidebarView = require("../../../../../base/static/js/views/sidebar-view.js");
const GISLegendView = require("mapseed-gis-legend-view");
const LegendView = require("mapseed-legend-view");

module.exports = SidebarView.extend({

  // BEGIN FLAVOR-SPECIFIC CODE
  events: {
    "click .sidebar-panel__close-panel": "onCloseLayerPanel"
  },

  initialize: function() {
    this.$el.append("<div id='map-legend'></div>");
    this.$el.append("<div id='gis-legend'></div>");

    this.$("#gis-legend").html(Handlebars.templates["sidebar"]({
      sidebarConfig: this.options.sidebarConfig.panels[0],
    }));

    this.$("#map-legend").html(Handlebars.templates["legend"]());

    this.legendView = new LegendView({
      el: this.$("#map-legend"),
    }).render();

    this.gisLegendView = new GISLegendView({
      el: this.$("#gis-legend"),
      mapView: this.options.mapView,
      config: this.options.sidebarConfig.panels[0],
      placeConfig: this.options.placeConfig,
      sidebarView: this,
    }).render();

    this.$("#map-legend").removeClass("is-hidden");
    this.$("#gis-legend").addClass("is-hidden");
  },

  onCloseLayerPanel: function() {
    this.$el.removeClass("sidebar-container--visible");
    this.$el.addClass("sidebar-container--hidden")
    if ($("#main-btns-container").hasClass("pos-top-left")) {
      $("#main-btns-container").toggleClass("main-btns-container--offset-left");
    }
  },

  render: function(panel) {
    if (panel === "layers") {
      this.$("#map-legend").addClass("is-hidden");
      this.$("#gis-legend").removeClass("is-hidden");
    } else if (panel === "legend") {
      this.$("#map-legend").removeClass("is-hidden");
      this.$("#gis-legend").addClass("is-hidden");
    }
    // END FLAVOR-SPECIFIC CODE
  },
});
