const GISLegendView = require("../../../../../base/static/js/views/gis-legend-view.js");

module.exports = GISLegendView.extend({

  events: {
    "change .map-legend-basemap-radio": "toggleBasemap",
    "change .map-legend-checkbox": "toggleVisibility",
    "change .map-legend-grouping-checkbox": "toggleHeaderVisibility",
    "click .info-icon": "onClickInfoIcon",
  },

  initialize: function() {
    this.options.mapView.map.on("layer:loading", this.onLayerLoading.bind(this));
    this.options.mapView.map.on("layer:loaded", this.onLayerLoaded.bind(this));
    this.options.mapView.map.on("layer:error", this.onLayerError.bind(this));

    this.hasScrolled = false;
    this.initialScrollPoint;
    this.options.sidebarView.$("#gis-layers-pane")
      .off("scroll")
      .on("scroll", this.onLayersPaneScroll.bind(this));

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
  },

  render: function() {
    return this;
  }
});
