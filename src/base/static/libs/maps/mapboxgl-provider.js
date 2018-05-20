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
      sprite: [
        window.location.protocol,
        "//",
        window.location.host,
        "/static/css/images/markers/spritesheet",
      ].join(""),
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
    this._map.addSource(options.id, {
      type: "vector",
      tiles: [options.url],
    });

    return fetch(options.style_url)
      .then(response => {
        return response.json();
      })
      .then(result => {
        result.layers.forEach(layerConfig => {
          layerConfig.source = options.id;
          layerConfig["source-layer"] = options.source_layer;
        });

        return result.layers;
      });
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

  createGeoJSONLayer: function(options) {
    this._map.addSource(options.id, {
      type: "geojson",
      data: options.url,
    });

    return options.rules.map((styleRule, i) => {
      styleRule.id = [options.id, "_", i].join("");
      styleRule.source = options.id;

      return styleRule;
    });
  },

  addLayer: function(layerConfig) {
    this._map.addLayer(layerConfig);
  },

  addVectorLayerGroup: function(layerStyles) {
    layerStyles.forEach(layerStyle => {
      this._map.addLayer(layerStyle);
    });
  },

  addGeoJSONLayer: function(layerStyles, geometryType) {
    // TODO: Can we detect GeoJSON geometry types automatically instead?
    // What about datasets with multiple geometry types?
    // It's possible to obtain the geometry type in filter expressions, e.g.:
    // ["==", "$type", "Point"]

    if (geometryType === "Point") {
      layerStyles.forEach(layerStyle => {
        layerStyle.layout["icon-allow-overlap"] = true;
        layerStyle.type = "symbol";
        this._map.addLayer(layerStyle);
      });
    } else if (geometryType === "Polygon") {
      layerStyles.forEach(layerStyle => {
        layerStyle.type = "fill";
        this._map.addLayer(layerStyle);
      });
    } else if (geometryType === "LineString") {
      layerStyles.forEach(layerStyle => {
        layerStyle.type = "line";
        this._map.addLayer(layerStyle);
      });
    }
  },
};

export default AbstractMapFactory(mapboxGLMethods);
