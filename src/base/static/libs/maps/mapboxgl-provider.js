import AbstractMapFactory from "./abstract-provider";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = MAP_PROVIDER_TOKEN;

const mapboxGLMethods = {
  createMap: function(container, options) {
    options.container = container;
    options.style = {
      version: 8,
      sources: {},
      layers: [],
    };
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

  createRasterTileLayer: function(options) {
    // TODO: return the created store and cache that?
    return {
      id: options.id,
      type: "raster",
      source: {
        type: "raster",
        tiles: [options.url],
      },
    };
  },

  createVectorTileLayer: function(options) {
    return {
      id: options.id,
      type: options.vector_type,
      "source-layer": options.source_layer,
      source: {
        id: options.id,
        type: "vector",
        tiles: [options.url],
      },
    };
  },

  // https://www.mapbox.com/mapbox-gl-js/example/wms/
  // http://cite.opengeospatial.org/pub/cite/files/edu/wms/text/operations.html#getmap
  createWMSLayer: function(options) {
    if (Array.isArray(options.layers)) {
      options.layers = options.layers.join(",");
    }

    const requestUrl = [
      options.url,
      "?service=wms&request=getmap&format=",
      options.format,
      "&version=",
      options.version,
      "&crs=EPSG:3857&transparent=",
      options.transparent,
      "&layers=",
      options.layers,
      "&bbox={bbox-epsg-3857}&width=256&height=256&styles=",
      options.style ? options.style : "default",
    ].join("");

    return {
      id: options.id,
      type: "raster",
      source: {
        type: "raster",
        tiles: [requestUrl],
      },
      tileSize: 256,
    };
  },

  // https://stackoverflow.com/questions/35566940/wmts-geotiff-for-a-mapbox-gl-source
  // http://cite.opengeospatial.org/pub/cite/files/edu/wmts/text/operations.html#examples-requests-and-responses-for-tile-resources
  createWMTSLayer: function(options) {
    const requestUrl = [
      options.url,
      "?service=wmts&request=gettile&layers=",
      options.layers,
      "&version=",
      options.version,
      "&tilematrixset=",
      options.tilematrix_set,
      "&format=",
      options.format,
      "&transparent=",
      options.transparent,
      "&style=",
      options.style ? options.style : "default",
      "&height=256&width=256&tilematrix={z}&tilecol={x}&tilerow={y}",
    ].join("");

    return {
      id: options.id,
      type: "raster",
      source: {
        type: "raster",
        tiles: [requestUrl],
      },
    };
  },

  addLayer: function(layerConfig) {
    this.guardedAddLayer(layerConfig);
  },

  guardedAddLayer: function(layerConfig) {
    if (this._map.isStyleLoaded()) {
      this._map.addLayer(layerConfig);
    } else {
      this._map.on("load", () => {
        this._map.addLayer(layerConfig);
      });
    }
  },
};

export default AbstractMapFactory(mapboxGLMethods);
