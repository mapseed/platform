let AppView = require("../../../../../base/static/js/views/app-view.js");
let Util = require("../../../../../base/static/js/utils.js");

module.exports = AppView.extend({
  hidePanel: function() {
    var map = this.mapView.map;

    this.unfocusAllPlaces();
    this.$panel.hide();
    this.setBodyClass();
    map.invalidateSize({ animate: true, pan: true });

    // Begin flavor-specific code
    $("#main-btns-container").attr("class", "pos-top-left");
    // End flavor-specific code

    Util.log("APP", "panel-state", "closed");
    this.hideSpotlightMask();
  }
});