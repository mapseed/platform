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

    queryRenderedFeatures: (geometry, options = {}) => {
      return map.queryRenderedFeatures(geometry, options);
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
      const rules = Object.entries(options.rules).map(
        ([locationType, styleRules]) => {
          const locationTypeFilter = [
            "==",
            ["get", "location_type"],
            locationType,
          ];
          return styleRules.map((styleRule, i) => {
            if (styleRule.filter[0] !== "all") {
              // If an existing filter does not already start with the logical
              // AND oprtator "all", we need to prepend it before we add the
              // location_type filter.
              styleRule.filter = ["all", styleRule.filter, locationTypeFilter];
            } else {
              styleRule.filter.push(locationTypeFilter);
            }

            styleRule.source = options.id;
            styleRule.id = `${locationType}_${i}`;
            return styleRule;
          });
        },
      );

      return rules.reduce((flat, toFlatten) => {
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

    addGeoJSONLayer: (layerStyles, geometryType) => {
      // TODO: Can we detect GeoJSON geometry types automatically instead?
      // What about datasets with multiple geometry types?
      // It's possible to obtain the geometry type in filter expressions, e.g.:
      // ["==", "$type", "Point"]

      if (geometryType === "Point") {
        layerStyles.forEach(layerStyle => {
          layerStyle.layout["icon-allow-overlap"] = true;
          layerStyle.type = "symbol";
          map.addLayer(layerStyle);
        });
      } else if (geometryType === "Polygon") {
        layerStyles.forEach(layerStyle => {
          layerStyle.type = "fill";
          map.addLayer(layerStyle);
        });
      } else if (geometryType === "LineString") {
        layerStyles.forEach(layerStyle => {
          layerStyle.type = "line";
          map.addLayer(layerStyle);
        });
      }
    },
  });
};
