import AbstractMapFactory from "./abstract-provider";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import VectorTileClient from "../../client/vector-tile-client";

import constants from "../../constants";

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

const layerToSymbol = layerConfigs => {
  return layerConfigs.map(layerConfig => {
    const fallbackIconImage =
      (layerConfig["symbol-layout"] &&
        layerConfig["symbol-layout"]["icon-image"]) ||
      "no-icon-image";
    return {
      id: `${layerConfig.id}_symbol`,
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
  });
};

const layerToLine = layerConfigs => {
  return layerConfigs.map(layerConfig => {
    const fallbackLineColor =
      (layerConfig["line-paint"] && layerConfig["line-paint"]["line-color"]) ||
      "#f86767";
    const fallbackLineOpacity =
      (layerConfig["line-paint"] &&
        layerConfig["line-paint"]["line-opacity"]) ||
      0.7;
    return {
      id: `${layerConfig.id}_line`,
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
  });
};

const layerToFill = layerConfigs => {
  return layerConfigs.map(layerConfig => {
    const fallbackFillColor =
      (layerConfig["fill-paint"] && layerConfig["fill-paint"]["fill-color"]) ||
      "#f1f075";
    const fallbackFillOpacity =
      (layerConfig["fill-paint"] &&
        layerConfig["fill-paint"]["fill-opacity"]) ||
      0.3;
    return {
      id: `${layerConfig.id}_fill`,
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
  });
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

  const map = new mapboxgl.Map(options.map);
  map.addControl(
    new mapboxgl.NavigationControl(options.control),
    options.control.position,
  );

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

    bindPlaceLayerEvent: (eventName, layer, callback) => {
      ["symbol", "fill", "line"].forEach(layerGeometryType => {
        const layerId = `${layer.id}_${layerGeometryType}`;
        let topmostProperties;
        map.on(eventName, layerId, evt => {
          if (eventName === "click") {
            // For click events, we query rendered features here to obtain a
            // single array of layers below the clicked-on point. The first
            // entry in this array corresponds to the topmost rendered feature.
            topmostProperties = map.queryRenderedFeatures(
              [evt.point.x, evt.point.y],
              {
                // Limit these click listeners to place geometry.
                filter: ["==", ["get", "type"], "place"],
              },
            )[0].properties;
          }

          callback(topmostProperties);
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

    createRasterTileLayer: options => {
      return {
        id: options.id,
        type: "raster",
        source: {
          type: "raster",
          tiles: [options.url],
        },
      };
    },

    createVectorTileLayer: async options => {
      map.addSource(options.id, {
        type: "vector",
        tiles: [options.url],
      });

      const style = await VectorTileClient.fetchStyle(options.style_url);

      return style.layers.map(layer => {
        layer.source = options.id;
        layer["source-layer"] = options.source_layer;
        return layer;
      });
    },

    // https://www.mapbox.com/mapbox-gl-js/example/wms/
    // http://cite.opengeospatial.org/pub/cite/files/edu/wms/text/operations.html#getmap
    createWMSLayer: options => {
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
    createWMTSLayer: options => {
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

    getSource: sourceId => {
      return map.getSource(sourceId);
    },

    createGeoJSONLayer: ({ id, url, rules }) => {
      map.addSource(id, {
        type: "geojson",
        data: url,
      });

      return rules.map((styleRule, i) => ({
        ...styleRule,
        id: `${id}_${i}`,
        source: id,
      }));
    },

    createPlaceLayer: ({ id, rules, geoJSON }) => {
      map.addSource(id, {
        type: "geojson",
        data: geoJSON,
      });

      // We need to add a filter on location_type for place layers. We append
      // that filter programatically here to save repetition in the config.
      return Object.entries(rules)
        .map(([locationType, styleRules]) => {
          const locationTypeFilter = [
            "==",
            ["get", constants.LOCATION_TYPE_PROPERTY_NAME],
            locationType,
          ];
          return styleRules.map((styleRule, i) => ({
            ...styleRule,
            filter: appendFilters(styleRule.filter, locationTypeFilter),
            source: id,
            id: `${locationType}_${i}`,
          }));
        })
        .reduce((flat, toFlatten) => {
          return flat.concat(toFlatten);
        }, []);
    },

    addLayer: layerConfig => {
      map.addLayer(layerConfig);
    },

    addVectorLayerGroup: layerConfigs => {
      layerConfigs.forEach(layerConfig => {
        map.addLayer(layerConfig);
      });
    },

    addGeoJSONLayer: layerConfigs => {
      layerToSymbol(layerConfigs).forEach(layerConfig => {
        map.addLayer(layerConfig);
      });
      layerToLine(layerConfigs).forEach(layerConfig => {
        map.addLayer(layerConfig);
      });
      layerToFill(layerConfigs).forEach(layerConfig => {
        map.addLayer(layerConfig);
      });
    },
  });
};
