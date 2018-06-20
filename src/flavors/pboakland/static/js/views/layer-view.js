const LayerView = require("../../../../../base/static/js/views/layer-view.js");

module.exports = LayerView.extend({
  show: function(isFocusing = false) {
    if (!this.isHiddenByFilters && this.layer) {
      this.layerGroup.addLayer(this.layer);
      // Make sure that focused markers are always on top of surrounding markers
      if (this.layer instanceof L.Marker) {
        isFocusing
          ? this.layer.setZIndexOffset(6000)
          : this.layer.setZIndexOffset(0);
      }

      // BEGIN CUSTOM CODE
      // Make sure that the projects-2017 pins always render on top of other
      // map markers.
      if (this.model.get("location_type") === "projects-2017") {
        this.layer.setZIndexOffset(8000);
      }
      // END CUSTOM CODE
    } else {
      this.hide();
    }
  },
});
