import AbstractMapFactory from "./abstract-provider";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import VectorTileClient from "../../client/vector-tile-client";

mapboxgl.accessToken = MAP_PROVIDER_TOKEN;

const appendFilters = (existingFilters, ...filtersToAdd) => {
  const newFilters = filtersToAdd.reduce(
    (newFilters, filterToAdd) => [...newFilters, filterToAdd],
    [existingFilters],
  );

  // If an existing filter does not already start with the logical AND
  // operator "all", we need to prepend it before we add a new filter.
  if (newFilters[0] !== "all") {
    newFilters.unshift("all");
  }

  return newFilters;
};

const configRuleToSymbolLayer = (layerConfig, i) => {
  const fallbackIconImage =
    (layerConfig["symbol-layout"] &&
      layerConfig["symbol-layout"]["icon-image"]) ||
    "no-icon-image";
  return {
    id: `${layerConfig.baseLayerId}_symbol_${i}`,
    source: layerConfig.source,
    type: "symbol",
    layout: {
      "icon-image": [
        "case",
        ["all", ["has", "style"], ["has", "iconUrl", ["get", "style"]]],
        ["get", "iconUrl", ["get", "style"]],
        fallbackIconImage,
      ],
      "icon-allow-overlap": true,
      ...layerConfig["symbol-layout"],
    },
    paint: layerConfig["symbol-paint"] || {},
    filter: appendFilters(layerConfig.filter, [
      "==",
      ["geometry-type"],
      "Point",
    ]),
  };
};

const configRuleToLineLayer = (layerConfig, i) => {
  const fallbackLineColor =
    (layerConfig["line-paint"] && layerConfig["line-paint"]["line-color"]) ||
    "#f86767";
  const fallbackLineOpacity =
    (layerConfig["line-paint"] && layerConfig["line-paint"]["line-opacity"]) ||
    0.7;
  return {
    id: `${layerConfig.baseLayerId}_line_${i}`,
    source: layerConfig.source,
    type: "line",
    layout: layerConfig["line-layout"] || {},
    paint: {
      "line-color": [
        "case",
        ["all", ["has", "style"], ["has", "color", ["get", "style"]]],
        ["get", "color", ["get", "style"]],
        fallbackLineColor,
      ],
      "line-opacity": [
        "case",
        ["all", ["has", "style"], ["has", "opacity", ["get", "style"]]],
        ["get", "opacity", ["get", "style"]],
        fallbackLineOpacity,
      ],
      ...layerConfig["line-paint"],
    },
    filter: appendFilters(layerConfig.filter, [
      "==",
      ["geometry-type"],
      "LineString",
    ]),
  };
};

const configRuleToFillLayer = (layerConfig, i) => {
  const fallbackFillColor =
    (layerConfig["fill-paint"] && layerConfig["fill-paint"]["fill-color"]) ||
    "#f1f075";
  const fallbackFillOpacity =
    (layerConfig["fill-paint"] && layerConfig["fill-paint"]["fill-opacity"]) ||
    0.3;
  return {
    id: `${layerConfig.baseLayerId}_fill_${i}`,
    source: layerConfig.source,
    type: "fill",
    layout: layerConfig["fill-layout"] || {},
    paint: {
      "fill-color": [
        "case",
        ["all", ["has", "style"], ["has", "fillColor", ["get", "style"]]],
        ["get", "fillColor", ["get", "style"]],
        fallbackFillColor,
      ],
      "fill-opacity": [
        "case",
        ["all", ["has", "style"], ["has", "fillOpacity", ["get", "style"]]],
        ["get", "fillOpacity", ["get", "style"]],
        fallbackFillOpacity,
      ],
      ...layerConfig["fill-paint"],
    },
    filter: appendFilters(layerConfig.filter, [
      "==",
      ["geometry-type"],
      "Polygon",
    ]),
  };
};

export default (container, options) => {
  options.map.container = container;
  options.map.style = {
    version: 8,
    sources: {},
    layers: [],
    sprite: `${window.location.protocol}//${
      window.location.host
    }/static/css/images/markers/spritesheet`,
  };

  const layersCache = {};

  const createRasterTileLayer = ({ id, url }) => {
    layersCache[id] = [
      {
        id: id,
        type: "raster",
        source: {
          type: "raster",
          tiles: [url],
        },
      },
    ];
  };

  const createVectorTileLayer = async ({
    id,
    url,
    style_url,
    source_layer,
  }) => {
    map.addSource(id, {
      type: "vector",
      tiles: [url],
    });

    const style = await VectorTileClient.fetchStyle(style_url);

    layersCache[id] = style.layers.map(layer => {
      layer.source = id;
      layer["source-layer"] = source_layer;
      return layer;
    });
  };

  // https://www.mapbox.com/mapbox-gl-js/example/wms/
  // http://cite.opengeospatial.org/pub/cite/files/edu/wms/text/operations.html#getmap
  const createWMSLayer = ({
    id,
    layers,
    url,
    format,
    version,
    transparent,
    style,
  }) => {
    if (Array.isArray(layers)) {
      layers = layers.join(",");
    }

    const requestUrl = [
      url,
      "?service=wms&request=getmap&format=",
      format,
      "&version=",
      version,
      "&crs=EPSG:3857&transparent=",
      transparent,
      "&layers=",
      layers,
      "&bbox={bbox-epsg-3857}&width=256&height=256&styles=",
      style ? style : "default",
    ].join("");

    layersCache[id] = [
      {
        id: id,
        type: "raster",
        source: {
          type: "raster",
          tiles: [requestUrl],
        },
        tileSize: 256,
      },
    ];
  };

  // https://stackoverflow.com/questions/35566940/wmts-geotiff-for-a-mapbox-gl-source
  // http://cite.opengeospatial.org/pub/cite/files/edu/wmts/text/operations.html#examples-requests-and-responses-for-tile-resources
  const createWMTSLayer = ({
    id,
    url,
    layers,
    version,
    tilematrix_set,
    format,
    transparent,
    style,
  }) => {
    const requestUrl = [
      url,
      "?service=wmts&request=gettile&layers=",
      layers,
      "&version=",
      version,
      "&tilematrixset=",
      tilematrix_set,
      "&format=",
      format,
      "&transparent=",
      transparent,
      "&style=",
      style ? style : "default",
      "&height=256&width=256&tilematrix={z}&tilecol={x}&tilerow={y}",
    ].join("");

    layersCache[id] = [
      {
        id: id,
        type: "raster",
        source: {
          type: "raster",
          tiles: [requestUrl],
        },
      },
    ];
  };

  const createGeoJSONLayer = ({ id, source, rules }) => {
    map.addSource(id, {
      type: "geojson",
      data: source,
    });

    rules = rules.map(rule => ({
      baseLayerId: id,
      source: id,
      ...rule,
    }));

    // NOTE: We create a lot of layers here, which could be a performance
    // bottleneck.
    // See: https://github.com/mapseed/platform/issues/961
    layersCache[id] = rules
      .map(configRuleToSymbolLayer)
      .concat(rules.map(configRuleToLineLayer))
      .concat(rules.map(configRuleToFillLayer));
  };

  const map = new mapboxgl.Map(options.map);
  map.addControl(
    new mapboxgl.NavigationControl(options.control),
    options.control.position,
  );
  const removeConstituentLayers = layerId => {
    const layers = Array.isArray(layersCache[layerId])
      ? layersCache[layerId]
      : [layersCache[layerId]];
    layers.forEach(layer => map.removeLayer(layer.id));
  };

  return AbstractMapFactory({
    on: (event, callback, context) => {
      callback = callback.bind(context);
      map.on(event, callback);
    },

    off: (event, callback) => {
      map.off(event, callback);
    },

    onLayerEvent: (event, layerId, callback, context) => {
      callback = callback.bind(context);
      map.on(event, layerId, callback);
    },

    bindPlaceLayerEvent: (eventName, layerId, callback) => {
      layersCache[layerId].forEach(mapProviderLayer => {
        let targetLayer = null;
        map.on(eventName, mapProviderLayer.id, evt => {
          if (eventName === "click") {
            // For click events, we query rendered features here to obtain a
            // single array of layers below the clicked-on point. The first
            // entry in this array corresponds to the topmost rendered feature.
            // We skip this work for other events (like mouseenter), since we
            // don't make use of information about the layer under the cursor
            // in those cases.
            targetLayer = map.queryRenderedFeatures(
              [evt.point.x, evt.point.y],
              {
                // Limit these click listeners to place geometry.
                filter: ["==", ["get", "type"], "place"],
              },
            )[0];
          }

          callback(targetLayer);
        });
      });
    },

    setCursor: style => {
      map.getCanvas().style.cursor = style;
    },

    getMap: () => {
      return map;
    },

    getCanvas: () => {
      return map.getCanvas();
    },

    queryRenderedFeatures: (geometry, options = {}) => {
      return map.queryRenderedFeatures(geometry, options);
    },

    makeLngLatBounds: (lng, lat) => {
      return new mapboxgl.LngLatBounds(lng, lat);
    },

    fitBounds: (bounds, options) => {
      map.fitBounds(bounds, options);
    },

    hasLayer: layerId => {
      return !!map.getLayer(layerId);
    },

    addLayer: async layer => {
      if (!layersCache[layer.id]) {
        switch (layer.type) {
          case "mapbox-style":
            addMapoxStyle(layer);
            break;
          case "raster-tile":
            createRasterTileLayer(layer);
            break;
          case "wms":
            createWMSLayer(layer);
            break;
          case "wmts":
            createWMTSLayer(layer);
            break;
          case "vector-tile":
            await createVectorTileLayer(layer);
            break;
          case "json":
            createGeoJSONLayer(layer);
            break;
        }
      }

      layersCache[layer.id].forEach(internalLayer => {
        console.log("!!!", map.getLayer(internalLayer.id));
        !map.getLayer(internalLayer.id) && map.addLayer(internalLayer);
      });
    },

    removeLayer: layer => {
      console.log("removing", layer);
      layer &&
        layersCache[layer.id].forEach(internalLayer => {
          !!map.getLayer(internalLayer.id) && map.removeLayer(internalLayer.id);
        });
    },

    isLayerCached: layerId => {
      return !!layersCache[layerId];
    },

    getSource: sourceId => {
      return map.getSource(sourceId);
    },

    addMapboxStyle: styleUrl => {
      map.setStyle(styleUrl);
    },

    setMaxZoom: zoom => {
      map.setMaxZoom(zoom);
    },

    getZoom: () => {
      return map.getZoom();
    },

    getBBoxString: () => {
      return map.getBounds().toString();
    },

    getCenter: () => {
      return map.getCenter();
    },

    setCenter: coordinates => {
      map.setCenter(coordinates);
    },

    easeTo: options => {
      map.easeTo(options);
    },

    flyTo: options => {
      map.flyTo(options);
    },

    invalidateSize: () => {
      map.resize();
    },
  });
};
