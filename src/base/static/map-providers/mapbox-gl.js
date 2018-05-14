import AbstractMapFactory from "./abstract-map-factory";
import { Map } from "mapbox-gl";

const mapboxGLMethods = {
  createMap: function(container, options) {
    options.container = container;
    this.map = new Map(options);

    return this;
  },

  on: function(event, callback, context) {
    callback = callback.bind(context);
    let eventName;
    switch (event) {
      case "zoomstart":
        eventName = "zoomstart";
        break;
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

    this.map.on(eventName, callback);
  },

  getMap: function() {
    return this.map;
  }
};

export default AbstractMapFactory(mapboxGLMethods);
