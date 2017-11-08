const SidebarView = require("../../../../../base/static/js/views/sidebar-view.js");
const GISLegendView = require("mapseed-gis-legend-view");

module.exports = SidebarView.extend({

  render: function() {
    // BEGIN FLAVOR-SPECIFIC CODE
    var data = {

      // we assume there's only one panel in this flavor--the gis layers
      sidebarConfig: this.options.sidebarConfig.panels[0],
    };

    this.$el.html(Handlebars.templates["sidebar"](data));

    new GISLegendView({
      el: "#sidebar-panel",
      mapView: this.options.mapView,
      config: this.options.sidebarConfig.panels[0],
      placeConfig: this.options.placeConfig,
      sidebarView: this,
    }).render();
    // END FLAVOR-SPECIFIC CODE
  },
});
