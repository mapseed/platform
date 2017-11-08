const GISLegendView = require("../../../../../base/static/js/views/gis-legend-view.js");

module.exports = GISLegendView.extend({

  events: {
    "change .map-legend-basemap-radio": "toggleBasemap",
    "change .map-legend-checkbox": "toggleVisibility",
    "change .map-legend-grouping-checkbox": "toggleHeaderVisibility",
    "click .info-icon": "onClickInfoIcon",
    "click .sidebar-panel__close-panel": "onCloseLayerPanel"
  },

  onCloseLayerPanel: function() {
    this.$el.toggleClass("sidebar-panel--hidden sidebar-panel--visible");
    if ($("#main-btns-container").hasClass("pos-top-left")) {
      $("#main-btns-container").toggleClass("main-btns-container--offset-left");
    }
  },

  render: function() {
    var self = this,
      data = _.extend(
        {
          basemaps: this.options.config.basemaps,
          groupings: this.options.config.groupings,
        },
        Shareabouts.stickyFieldValues,
      );

    // BEGIN FLAVOR-SPECIFIC CODE
    //this.$el.html(Handlebars.templates["gis-legend-content"](data));
    // END FLAVOR-SPECIFIC CODE

    _.each(this.options.config.groupings, function(group) {
      _.each(group.layers, function(layer) {
        if (layer.constituentLayers) {
          layer.constituentLayers.forEach(function(id) {
            $(Shareabouts).trigger("visibility", [id, !!layer.visibleDefault]);
          });
        } else {
          $(Shareabouts).trigger("visibility", [
            layer.id,
            !!layer.visibleDefault,
          ]);
        }
      });
    });

    var initialBasemap = _.find(this.options.config.basemaps, function(
      basemap,
    ) {
      return !!basemap.visibleDefault;
    });

    $(Shareabouts).trigger("visibility", [
      initialBasemap.id,
      !!initialBasemap.visibleDefault,
      true,
    ]);
    
    return this;
  }
});
