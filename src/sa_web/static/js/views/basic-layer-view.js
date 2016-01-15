/*globals L Backbone _ jQuery */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.BasicLayerView = S.LayerView.extend({
    initialize: function() {
      S.LayerView.prototype.initialize.call(this)
    },
    removeLayer: function() {
      if (this.layer) {
        this.options.landmarkLayers.removeLayer(this.layer);
      }
    },
    onMarkerClick: function() {
      S.Util.log('USER', 'map', 'landmark-layer-click', this.model.getLoggingDetails());
      this.options.router.navigate('/' + this.model.id, {trigger: true});
    },
    show: function() {
      if (!this.options.mapView.locationTypeFilter ||
        this.options.mapView.locationTypeFilter.toUpperCase() === this.model.get('location_type').toUpperCase()) {
        if (this.layer) {
          this.options.landmarkLayers.addLayer(this.layer);
        }
      } else {
        this.hide();
      }
    },
    removeLayer: function() {
      if (this.layer) {
        this.options.landmarkLayers.removeLayer(this.layer);
      }
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));
