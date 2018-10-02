var Util = require("../../../../base/static/js/utils.js");
var mapbox_geocode = Util.Mapbox.geocode;

Util.Mapbox.geocode = function(location, bounds, options) {
  // Since this is all Chicago-specific, go ahead and specify the city.
  if (
    location.toLowerCase().indexOf("greensboro") === -1 &&
    location.toLowerCase().indexOf(" nc") === -1
  ) {
    location += ", Greensboro, NC";
  }
  return mapbox_geocode.call(this, location, bounds, options);
};
