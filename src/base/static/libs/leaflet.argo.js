/*globals $ L*/

/*
 * Argo turns any GeoJSON data into a Leaflet layer.
 */

L.Argo = L.GeoJSON.extend({

  initialize: function (geojson, options) {
    // Add options and function to L.Util
    L.Util.setOptions(this, options);
    L.Util.setOptions(this, {
      pointToLayer: this._pointToLayer.bind(this),
      onEachFeature: this._onEachFeature
    });

    var successHandler = L.Util.bind(function(geojson) {
          this.addData(geojson);
//          this.fire('loaded', {layer: this});
        }, this),
        errorHandler = L.Util.bind(function() {
          this.fire('error', {layer: this});
        }, this);

    // Init layers
    this._layers = {};

    // Just add data if this is an object
    if (geojson === Object(geojson)) {
      this.addData(geojson);
    } else if (typeof geojson === 'string') {
      // This is a url, go fetch the geojson
      if (this.options.type === 'geoserver') {
        // Handle geoserver specially
        this._getGeoJsonFromGeoServer(geojson, successHandler, errorHandler);
      } else {
        // Handle regular ajax
        this._getGeoJson(geojson, successHandler, errorHandler);
      }
    }
  },

  _pointToLayer: function (feature, latlng) {
    var style = L.Argo.getStyleRule(feature, this.options.rules);
    style['icon'] = L.icon(style.icon);
    return L.marker(latlng, style);
//    return new L.CircleMarker(latlng);
  },

  _onEachFeature: function(feature, layer) {
    var style, popupContent;
    if (layer.feature.geometry['type'] == 'Point') {
      style = feature; // feature has already been transformed for marker points
    } else {
      style = L.Argo.getStyleRule(feature, this.rules);
    }

    // Get our popup contents using the template outlined in our option's config
    // which replaces our {{key}} with feature.properties.key
    if (this.popupContent) {
      popupContent = L.Argo.t(this.popupContent, feature.properties);
    }

    if (style) {
      // Only clickable if there is popup content; convert to bool
      style.clickable = !!popupContent;

      // Set the style manually since so I can use popupContent to set clickable
      if (layer.feature.geometry['type'] != 'Point') {
        layer.setStyle(style.style);
      }

      // Handle radius for circle marker
      if (layer.setRadius && style.radius) {
        layer.setRadius(style.radius);
      }

      // Init the popup
      if (popupContent) {
        layer.bindPopup(popupContent);
      }
    } else {
      layer.setStyle({
        fill: false,
        stroke: false
      });
    }
  },

  _getGeoServerCallbackName: function() {
    var id = Math.floor(Math.random() * 0x10000).toString(16);
    return "ArgoJsonpCallback_" + id + '_' + $.expando + '_' + $.now();
  },

  _getGeoJsonFromGeoServer: function(url, success, error) {
    var callbackName = this._getGeoServerCallbackName();

    // Fetch the GeoJson from GeoServer
    $.ajax({
      url: url + '&format_options=callback:' + callbackName,
      dataType: 'jsonp',
      jsonpCallback: callbackName,
      success: success,
      error: error
    });
  },
  _getGeoJson: function(url, success, error) {
    // Fetch the GeoJson using the given type
    $.ajax({
      url: url,
      dataType: this.options.type,
      success: success,
      error: error
    });
  }
});

L.argo = function (geojson, options) {
  return new L.Argo(geojson, options);
};