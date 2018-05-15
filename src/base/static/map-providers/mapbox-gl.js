import AbstractMapFactory from "./abstract-map-factory";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = MAP_PROVIDER_TOKEN;

const mapboxGLMethods = {
  createMap: function(container, options) {
    options.container = container;
    this._map = new mapboxgl.Map(options);

    return this;
  },

  on: function(event, callback, context) {
    callback = callback.bind(context);
    let eventName;

    // TODO: This switch probably won't be necessary for mapbox-gl
    switch (event) {
      case "zoomstart":
        break;
        eventName = "zoomstart";
      case "zoomend":
        eventName = "zoomend";
        break;
      case "movestart":
        eventName = "movestart";
        break;
      case "moveend":
        eventName = "moveend";
        break;
      case "dragstart":
        eventName = "dragstart";
        break;
      case "dragend":
        eventName = "dragend";
        break;
    }

    this._map.on(eventName, callback);
  },

  getMap: function() {
    return this._map;
  },

  addNavControl: function({ options, vendorOptions }) {
    this._navControl = new mapboxgl.NavigationControl(vendorOptions);
    this._map.addControl(this._navControl, options.position);

    return this._navControl;
  },

  addGeolocationControl: function(
    { position = "top-left" } = {},
    vendorOptions = {},
  ) {
    this.geolocationControl; // TODO
  },

  hasLayer: function(layerId) {
    return !!this._map.getLayer(layerId);
  },

  addMapboxStyle: function(styleUrl) {
    this._map.setStyle(styleUrl);
  },
};

export default AbstractMapFactory(mapboxGLMethods);
