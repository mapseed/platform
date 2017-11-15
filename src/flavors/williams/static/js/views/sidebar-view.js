const SidebarView = require("../../../../../base/static/js/views/sidebar-view.js");
const GISLegendView = require("mapseed-gis-legend-view");
const LegendView = require("mapseed-legend-view");

module.exports = SidebarView.extend({

  // BEGIN FLAVOR-SPECIFIC CODE
  events: {
    "click .sidebar-panel__close-panel": "onCloseLayerPanel"
  },

  initialize: function() {
    this.legendView = new LegendView({
      el: this.$el,
    });

    this.gisLegendView = new GISLegendView({
      el: this.$el,
      mapView: this.options.mapView,
      config: this.options.sidebarConfig.panels[0],
      placeConfig: this.options.placeConfig,
      sidebarView: this,
    }).render();    
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
      this.$el.html(Handlebars.templates["sidebar"]({
        sidebarConfig: this.options.sidebarConfig.panels[0],
      }));
      this.gisLegendView.render();
      this.gisLegendView.delegateEvents();
    } else if (panel === "legend") {
      this.$el.html(Handlebars.templates["legend"]());
      this.legendView.render();
      this.legendView.delegateEvents();
    }
    // END FLAVOR-SPECIFIC CODE
  },
});
