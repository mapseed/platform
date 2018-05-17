/* global MAP_PROVIDER_TOKEN */

import AbstractMapFactory from "./abstract-provider";
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
    this._map.on(event, callback);
  },

  getMap: function() {
    return this._map;
  },

  addNavControl: function({ options, vendorOptions }) {
    this._navControl = new mapboxgl.NavigationControl(vendorOptions);
    this._map.addControl(this._navControl, options.position);

    return this._navControl;
  },

  hasLayer: function(layerId) {
    return !!this._map.getLayer(layerId);
  },

  addMapboxStyle: function(styleUrl) {
    this._map.setStyle(styleUrl);
  },

  setMaxZoom: function(zoom) {
    this._map.setMaxZoom(zoom);
  },

  getZoom: function() {
    return this._map.getZoom();
  },

  getBBoxString: function() {
    return this._map.getBounds().toString();
  },

  getCenter: function() {
    return this._map.getCenter();
  },

  invalidateSize: function() {
    this._map.resize();
  },
};

export default AbstractMapFactory(mapboxGLMethods);
