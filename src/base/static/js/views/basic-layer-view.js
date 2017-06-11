var Util = require("../utils.js");

var LayerView = require("mapseed-layer-view");

module.exports = LayerView.extend({
  initialize: function() {
    LayerView.prototype.initialize.call(this);
  },
  removeLayer: function() {
    if (this.layer) {
      this.options.layer.removeLayer(this.layer);
    }
  },
  onMarkerClick: function() {
    Util.log(
      "USER",
      "map",
      "landmark-layer-click",
      this.model.getLoggingDetails(),
    );
    this.options.router.navigate("/" + this.model.id, { trigger: true });
  },
  show: function() {
    if (
      !this.options.mapView.locationTypeFilter ||
      this.options.mapView.locationTypeFilter.toUpperCase() ===
        this.model.get("location_type").toUpperCase()
    ) {
      if (this.layer) {
        this.options.layer.addLayer(this.layer);
      }
    } else {
      this.hide();
    }
  },
});
