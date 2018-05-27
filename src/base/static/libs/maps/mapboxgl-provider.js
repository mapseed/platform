import AbstractMapFactory from "./abstract-provider";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import VectorTileClient from "../../client/vector-tile-client";

mapboxgl.accessToken = MAP_PROVIDER_TOKEN;

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

  const _appendFilters = (existingFilters, ...filtersToAdd) => {
    const newFilters = [existingFilters.slice()];
    filtersToAdd.forEach(filterToAdd => newFilters.push(filterToAdd));

    // If an existing filter does not already start with the logical AND
    // operator "all", we need to prepend it before we add a new filter.
    if (newFilters[0] !== "all") {
      newFilters.unshift("all");
    }

    return newFilters;
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

    createGeoJSONLayer: options => {
      map.addSource(options.id, {
        type: "geojson",
        data: options.url,
      });

      return options.rules.map((styleRule, i) => {
        styleRule.id = `${options.id}_${i}`;
        styleRule.source = options.id;

        return styleRule;
      });
    },

    createPlaceLayer: (options, geoJSON) => {
      map.addSource(options.id, {
        type: "geojson",
        data: geoJSON,
      });

      // We need to add a filter on location_type for place layers. We append
      // that filter programatically here to save repetition in the config.
      return Object.entries(options.rules)
        .map(([locationType, styleRules]) => {
          const locationTypeFilter = [
            "==",
            ["get", "location_type"],
            locationType,
          ];
          return styleRules.map((styleRule, i) => {
            styleRule.filter = _appendFilters(
              styleRule.filter,
              locationTypeFilter,
            );
            styleRule.source = options.id;
            styleRule.id = `${locationType}_${i}`;
            return styleRule;
          });
        })
        .reduce((flat, toFlatten) => {
          return flat.concat(toFlatten);
        }, []);
    },

    addLayer: layerConfig => {
      map.addLayer(layerConfig);
    },

    addVectorLayerGroup: layerStyles => {
      layerStyles.forEach(layerStyle => {
        map.addLayer(layerStyle);
      });
    },

    addGeoJSONLayer: layerStyles => {
      // Points
      layerStyles
        .map(layerStyle => {
          const fallbackIconImage =
            (layerStyle["symbol-layout"] &&
              layerStyle["symbol-layout"]["icon-image"]) ||
            "no-icon-image";
          return {
            id: `${layerStyle.id}_symbol`,
            source: layerStyle.source,
            type: "symbol",
            layout: {
              "icon-image": [
                "case",
                ["all", ["has", "style"], ["has", "iconUrl", ["get", "style"]]],
                ["get", "iconUrl", ["get", "style"]],
                fallbackIconImage,
              ],
              "icon-allow-overlap": true,
              ...layerStyle["symbol-layout"],
            },
            paint: layerStyle["symbol-paint"] || {},
            filter: _appendFilters(layerStyle.filter, [
              "==",
              ["geometry-type"],
              "Point",
            ]),
          };
        })
        .forEach(layerStyle => {
          map.addLayer(layerStyle);
        });

      // Polygons
      layerStyles
        .map(layerStyle => {
          const fallbackFillColor =
            (layerStyle["fill-paint"] &&
              layerStyle["fill-paint"]["fill-color"]) ||
            "#f1f075";
          const fallbackFillOpacity =
            (layerStyle["fill-paint"] &&
              layerStyle["fill-paint"]["fill-opacity"]) ||
            0.3;
          return {
            id: `${layerStyle.id}_fill`,
            source: layerStyle.source,
            type: "fill",
            layout: layerStyle["fill-layout"] || {},
            paint: {
              "fill-color": [
                "case",
                [
                  "all",
                  ["has", "style"],
                  ["has", "fillColor", ["get", "style"]],
                ],
                ["get", "fillColor", ["get", "style"]],
                fallbackFillColor,
              ],
              "fill-opacity": [
                "case",
                [
                  "all",
                  ["has", "style"],
                  ["has", "fillOpacity", ["get", "style"]],
                ],
                ["get", "fillOpacity", ["get", "style"]],
                fallbackFillOpacity,
              ],
              ...layerStyle["fill-paint"],
            },
            filter: _appendFilters(layerStyle.filter, [
              "==",
              ["geometry-type"],
              "Polygon",
            ]),
          };
        })
        .forEach(layerStyle => {
          map.addLayer(layerStyle);
        });

      // LineStrings
      layerStyles
        .map(layerStyle => {
          const fallbackLineColor =
            (layerStyle["line-paint"] &&
              layerStyle["line-paint"]["line-color"]) ||
            "#f86767";
          const fallbackLineOpacity =
            (layerStyle["line-paint"] &&
              layerStyle["line-paint"]["line-opacity"]) ||
            0.7;
          return {
            id: `${layerStyle.id}_line`,
            source: layerStyle.source,
            type: "line",
            layout: layerStyle["line-layout"] || {},
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
              ...layerStyle["line-paint"],
            },
            filter: _appendFilters(layerStyle.filter, [
              "==",
              ["geometry-type"],
              "LineString",
            ]),
          };
        })
        .forEach(layerStyle => {
          map.addLayer(layerStyle);
        });
    },
  });
};
