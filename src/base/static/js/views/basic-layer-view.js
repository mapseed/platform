/*globals L Backbone _ jQuery */

var Shareabouts = Shareabouts || {};

(function(S, $, console){
  S.BasicLayerView = S.LayerView.extend({
    initialize: function() {
      S.LayerView.prototype.initialize.call(this)
    },
    removeLayer: function() {
      if (this.layer) {
        this.options.layer.removeLayer(this.layer);
      }
    },
    onMarkerClick: function() {
      var self = this;
      self.layer.editing.enable();
      self.layer = L.featureGroup([self.layer]).setStyle({fillColor: "#FF0000"});

      var drawControl = new L.Control.Draw({
        position: 'bottomright',
        edit: {
          featureGroup: self.layer
        }
      });
      this.map.addControl(drawControl);

      S.Util.log('USER', 'map', 'landmark-layer-click', this.model.getLoggingDetails());
      this.options.router.navigate('/' + this.model.id, {trigger: true});
    },
    show: function() {
      if (!this.options.mapView.locationTypeFilter ||
        this.options.mapView.locationTypeFilter.toUpperCase() === this.model.get('location_type').toUpperCase()) {
        if (this.layer) {
          this.options.layer.addLayer(this.layer);
        }
      } else {
        this.hide();
      }
    }
  });

}(Shareabouts, jQuery, Shareabouts.Util.console));
