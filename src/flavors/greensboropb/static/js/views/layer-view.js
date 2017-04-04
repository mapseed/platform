var LayerView = require('../../../../../base/static/js/views/layer-view.js');
var originalOnMarkerClick = LayerView.prototype.onMarkerClick;

module.exports = LayerView.extend({
  // onMarkerClick: function(evt) {
  //   var self = this;
  //   originalOnMarkerClick.apply(this, arguments);
  //   if (this.map.getZoom() < this.map.getMaxZoom()-3) {
  //     _.delay(function() {
  //       self.map.setView(evt.latlng, self.map.getMaxZoom()-3, {
  //         animate: true
  //       });

  //       self.map.invalidateSize({ animate:false, pan:false });
  //     }, 200);
  //   }
  // }
});