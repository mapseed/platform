import AbstractMapFactory from "./abstract-provider";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import VectorTileClient from "../../client/vector-tile-client";

import constants from "../../constants";

mapboxgl.accessToken = MAP_PROVIDER_TOKEN;

// https://www.mapbox.com/mapbox-gl-js/api#icontrol
class CustomControl {
  constructor({
    setLeftSidebarExpanded,
    setLeftSidebarComponent,
    ariaLabel,
    iconClass,
    component,
  }) {
    this._setLeftSidebarComponent = setLeftSidebarComponent;
    this._setLeftSidebarExpanded = setLeftSidebarExpanded;
    this._ariaLabel = ariaLabel;
    this._iconClass = iconClass;
    this._component = component;
  }

  onAdd() {
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    this._button = this._container.appendChild(
      document.createElement("button"),
    );
    this._button.className =
      "mapboxgl-ctrl-icon mapseed__map-control " + this._iconClass;
    this._button.setAttribute("type", "button");
    this._button.setAttribute("aria-label", this._ariaLabel);
    this._button.addEventListener("click", () => {
      this._setLeftSidebarComponent(this._component);
      this._setLeftSidebarExpanded(true);
    });

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
  }
}

const appendFilters = (existingFilters, ...filtersToAdd) => {
  const newFilters = filtersToAdd.reduce(
    (newFilters, filterToAdd) => [...newFilters, filterToAdd],
    existingFilters ? [existingFilters] : [],
  );

  // If an existing filter does not already start with the logical AND
  // operator "all", we need to prepend it before we add a new filter.
  newFilters[0] !== "all" && newFilters.unshift("all");

  return newFilters;
};

const NO_ICON_IMAGE = "__mapseed-no-icon-image__";
const configRuleToSymbolLayer = (layerConfig, i) => {
  const fallbackIconImage =
    (layerConfig["symbol-layout"] &&
      layerConfig["symbol-layout"]["icon-image"]) ||
    NO_ICON_IMAGE;
  return {
    id: `${layerConfig.baseLayerId}_symbol_${i}`,
    source: layerConfig.source,
    type: "symbol",
    layout: {
      ...layerConfig["symbol-layout"],
      "icon-image": [
        "case",
        ["to-boolean", ["get", constants.IS_HIDDEN_BY_FILTERS]],
        NO_ICON_IMAGE,
        [
          "all",
          ["has", constants.GEOMETRY_STYLE_PROPERTY_NAME],
          [
            "has",
            constants.MARKER_ICON_PROPERTY_NAME,
            ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
          ],
        ],
        [
          "get",
          constants.MARKER_ICON_PROPERTY_NAME,
          ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
        ],
        fallbackIconImage,
      ],
      "icon-allow-overlap": true,
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
      ...layerConfig["line-paint"],
      "line-color": [
        "case",
        [
          "all",
          ["has", constants.GEOMETRY_STYLE_PROPERTY_NAME],
          [
            "has",
            constants.LINE_COLOR_PROPERTY_NAME,
            ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
          ],
        ],
        [
          "get",
          constants.LINE_COLOR_PROPERTY_NAME,
          ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
        ],
        fallbackLineColor,
      ],
      "line-opacity": [
        "case",
        [
          "all",
          ["has", constants.GEOMETRY_STYLE_PROPERTY_NAME],
          [
            "has",
            constants.LINE_OPACITY_PROPERTY_NAME,
            ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
          ],
        ],
        [
          "get",
          constants.LINE_OPACITY_PROPERTY_NAME,
          ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
        ],
        fallbackLineOpacity,
      ],
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
  const fallbackOutlineColor =
    (layerConfig["outline-paint"] &&
      layerConfig["outline-paint"]["line-color"]) ||
    "#f86767";
  const fallbackOutlineOpacity =
    (layerConfig["outline-paint"] &&
      layerConfig["outline-paint"]["line-opacity"]) ||
    0.7;
  return [
    {
      id: `${layerConfig.baseLayerId}_fill_${i}`,
      source: layerConfig.source,
      type: "fill",
      layout: layerConfig["fill-layout"] || {},
      paint: {
        ...layerConfig["fill-paint"],
        "fill-color": [
          "case",
          [
            "all",
            ["has", constants.GEOMETRY_STYLE_PROPERTY_NAME],
            [
              "has",
              constants.FILL_COLOR_PROPERTY_NAME,
              ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
            ],
          ],
          [
            "get",
            constants.FILL_COLOR_PROPERTY_NAME,
            ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
          ],
          fallbackFillColor,
        ],
        "fill-opacity": [
          "case",
          [
            "all",
            ["has", constants.GEOMETRY_STYLE_PROPERTY_NAME],
            [
              "has",
              constants.FILL_OPACITY_PROPERTY_NAME,
              ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
            ],
          ],
          [
            "get",
            constants.FILL_OPACITY_PROPERTY_NAME,
            ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
          ],
          fallbackFillOpacity,
        ],
      },
      filter: appendFilters(layerConfig.filter, [
        "==",
        ["geometry-type"],
        "Polygon",
      ]),
    },
    {
      id: `${layerConfig.baseLayerId}_fill-outline_${i}`,
      source: layerConfig.source,
      type: "line",
      layout: layerConfig["outline-layout"] || {},
      paint: {
        ...layerConfig["outline-paint"],
        "line-color": [
          "case",
          [
            "all",
            ["has", constants.GEOMETRY_STYLE_PROPERTY_NAME],
            [
              "has",
              constants.LINE_COLOR_PROPERTY_NAME,
              ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
            ],
          ],
          [
            "get",
            constants.LINE_COLOR_PROPERTY_NAME,
            ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
          ],
          fallbackOutlineColor,
        ],
        "line-opacity": [
          "case",
          [
            "all",
            ["has", constants.GEOMETRY_STYLE_PROPERTY_NAME],
            [
              "has",
              constants.LINE_OPACITY_PROPERTY_NAME,
              ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
            ],
          ],
          [
            "get",
            constants.LINE_OPACITY_PROPERTY_NAME,
            ["get", constants.GEOMETRY_STYLE_PROPERTY_NAME],
          ],
          fallbackOutlineOpacity,
        ],
      },
      filter: appendFilters(layerConfig.filter, [
        "==",
        ["geometry-type"],
        "Polygon",
      ]),
    },
  ];
};

const configRuleToLabelLayer = (layerConfig, i) => ({
  id: `${layerConfig.baseLayerId}_label_${i}`,
  source: layerConfig.source,
  type: "symbol",
  layout: layerConfig["label-layout"] || {},
  paint: layerConfig["label-paint"] || {},
});

const DEFAULT_STYLE_NAME = "Mapseed default style";
const CLUSTER_LAYER_IDENTIFIER = "__mapseed-clusters__";
const FOCUSED_SOURCE_IDENTIFIER = "__mapseed-focused-source__";
const FOCUSED_LAYER_IDENTIFIER = "__mapseed-focused-layer__";
const EMPTY_GEOJSON = {
  type: "FeatureCollection",
  features: [],
};

/**
 * @typedef {Object } MapboxStyle - Defines the visual appearance of the map
 * https://www.mapbox.com/mapbox-gl-js/style-spec/
 *
 */
const defaultStyle = {
  version: 8,
  name: DEFAULT_STYLE_NAME,
  sources: {},
  layers: [],
  sprite: `${window.location.protocol}//${
    window.location.host
  }/static/css/images/markers/spritesheet`,
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
};

export default (container, options) => {
  options.map.container = container;
  options.map.style = defaultStyle;

  /**
   * @typedef {Object<string, MapboxLayer[]>} LayersCache - Mapping of layer id's to an array of the mapboxGL layer representations:
   *
   * @typedef {Object} MapboxLayer - https://www.mapbox.com/mapbox-gl-js/style-spec/#layers
   *
   */
  const layersCache = {};
  const sourcesCache = {
    [FOCUSED_SOURCE_IDENTIFIER]: {
      type: "geojson",
      data: EMPTY_GEOJSON,
    },
  };
  let topmostLayerId;

  const ensureFocusedSource = () => {
    !map.getSource(FOCUSED_SOURCE_IDENTIFIER) &&
      map.addSource(
        FOCUSED_SOURCE_IDENTIFIER,
        sourcesCache[FOCUSED_SOURCE_IDENTIFIER],
      );
  };

  const map = new mapboxgl.Map(options.map);
  map.on("load", () => {
    ensureFocusedSource();
  });

  const floatSymbolLayersToTop = () => {
    // To ensure that point (aka "symbol") geometry is not obscured we
    // move all symbol layers to the top of the layer stack.
    Object.values(layersCache)
      .reduce((flat, toFlatten) => [...flat, ...toFlatten], [])
      .filter(mapboxLayer => mapboxLayer.id.includes("symbol"))
      .forEach(mapboxLayer => map.moveLayer(mapboxLayer.id));
  };

  const addInternalLayers = (layerId, isBasemap) => {
    !map.getSource(layerId) && map.addSource(layerId, sourcesCache[layerId]);
    layersCache[layerId].forEach(internalLayer => {
      !map.getLayer(internalLayer.id) &&
        map.addLayer(
          internalLayer,
          isBasemap && map.getStyle().layers[0]
            ? // If we're adding a basemap, move it to the bottom of the layers
              // stack.
              map.getStyle().layers[0].id
            : null,
        );
    });
  };

  const addMapboxStyle = (layer, layerStatuses, mapConfig) => {
    const styleLoadCallback = () => {
      // Loading a new style will replace the existing style's sources, layers,
      // and spritesheet assets. Therefore, we recover existing style resources
      // after the new style has loaded.

      // Recover existing spritesheet assets.
      mapConfig.layers
        .map(layerConfig => layerConfig.rules)
        .reduce((flat, toFlatten) => flat.concat(toFlatten), [])
        .reduce((imageNames, rule) => {
          rule &&
            rule["symbol-layout"] &&
            imageNames.add(rule["symbol-layout"]["icon-image"]);
          return imageNames;
        }, new Set())
        .forEach(imageToAdd => {
          const img = new Image();
          img.onload = evt => {
            map.addImage(imageToAdd, evt.target);
          };
          img.src = `${window.location.protocol}//${
            window.location.host
          }/static/css/images/markers/${imageToAdd}`;
        });

      // Recover existing sources and layers.
      Object.entries(layerStatuses)
        .filter(
          ([layerId, layerStatus]) =>
            layerStatus.isVisible && layerId !== layer.id,
        )
        .forEach(([layerId, layerStatus]) => {
          addInternalLayers(layerId, layerStatus.isBasemap);
        });

      floatSymbolLayersToTop();
      map.off("style.load", styleLoadCallback);
    };
    map.on("style.load", styleLoadCallback);
    map.setStyle(layer.url);
  };

  const createRasterTileLayer = ({ id, url, scheme = "xyz" }) => {
    sourcesCache[id] = {
      type: "raster",
      tiles: [url],
      tileSize: 256,
      scheme: scheme,
    };

    layersCache[id] = [
      {
        id: id,
        type: "raster",
        source: id,
      },
    ];
  };

  const createVectorTileLayer = async ({
    id,
    url,
    style_url,
    mapbox_layers,
    source_layer,
  }) => {
    sourcesCache[id] = {
      type: "vector",
      tiles: [url],
    };

    // If the config declares an array of mapbox_layers, use that for styling
    // purposes. Otherwise, use the style_url to fetch a remote-hosted
    // Mapbox stylesheet with layer styling information.
    const mapboxLayers = mapbox_layers
      ? mapbox_layers
      : await VectorTileClient.fetchLayers(style_url);

    layersCache[id] = mapboxLayers.map(mapboxLayer => ({
      ...mapboxLayer,
      source: id,
      ["source-layer"]: source_layer,
    }));
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
      encodeURIComponent(layers),
      "&bbox={bbox-epsg-3857}&width=256&height=256&styles=",
      typeof style !== "undefined" ? style : "default",
    ].join("");

    sourcesCache[id] = {
      type: "raster",
      tiles: [requestUrl],
      tileSize: 256,
    };

    layersCache[id] = [
      {
        id: id,
        type: "raster",
        source: id,
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

    sourcesCache[id] = {
      type: "raster",
      tiles: [requestUrl],
      tileSize: 256,
    };

    layersCache[id] = [
      {
        id: id,
        type: "raster",
        source: id,
      },
    ];
  };

  const createGeoJSONLayer = ({
    id,
    source,
    cluster = {},
    rules = [],
    focus_rules = [],
    // Unless otherwise specified, we assume we need to create provider layers
    // for all feature types.
    feature_types = ["Point", "LineString", "Polygon", "Label"],
    popup_content,
  }) => {
    sourcesCache[id] = {
      type: "geojson",
      data: source,
      cluster: !!cluster.is_enabled,
      clusterRadius: cluster.cluster_radius || 50,
      clusterMaxZoom: cluster.cluster_max_zoom || 14,
    };

    rules = rules
      .map(rule => ({
        baseLayerId: id,
        source: id,
        ...rule,
      }))
      .concat(
        focus_rules.map(rule => ({
          baseLayerId: `${id}${FOCUSED_LAYER_IDENTIFIER}`,
          source: FOCUSED_SOURCE_IDENTIFIER,
          ...rule,
        })),
      );

    // TODO: Think about further optimizations for reducing/combining the
    // number of provider layers created here.
    layersCache[id] = []
      .concat(
        feature_types.includes("Point")
          ? rules.map(configRuleToSymbolLayer)
          : [],
      )
      .concat(
        feature_types.includes("LineString")
          ? rules.map(configRuleToLineLayer)
          : [],
      )
      .concat(
        feature_types.includes("Polygon")
          ? rules
              .map(configRuleToFillLayer)
              .reduce((flat, toFlatten) => flat.concat(toFlatten), [])
          : [],
      )
      .concat(
        feature_types.includes("Label")
          ? rules.map(configRuleToLabelLayer)
          : [],
      );

    if (cluster.is_enabled) {
      // https://www.mapbox.com/mapbox-gl-js/example/cluster/
      layersCache[id] = layersCache[id].concat([
        {
          id: `${id}${CLUSTER_LAYER_IDENTIFIER}`,
          source: id,
          type: "circle",
          filter: cluster.filter || ["has", "point_count"],
          paint: cluster.paint || {},
        },
        {
          id: `${id}${CLUSTER_LAYER_IDENTIFIER}count`,
          source: id,
          type: "symbol",
          filter: cluster.filter || ["has", "point_count"],
          // TODO: We might want to make this configurable at some point.
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["Arial Unicode MS Bold"],
            "text-size": 15,
          },
        },
      ]);
    }

    if (popup_content) {
      Object.values(layersCache[id])
        .filter(
          mapboxLayer => !mapboxLayer.id.includes(CLUSTER_LAYER_IDENTIFIER),
        )
        .forEach(mapboxLayer => {
          map.on("click", mapboxLayer.id, evt => {
            new mapboxgl.Popup()
              .setLngLat(evt.lngLat)
              .setHTML(
                parsePopupContent(popup_content, evt.features[0].properties),
              )
              .addTo(map);
          });
        });
    }
  };

  const parsePopupContent = (popupContent, properties) => {
    return popupContent.replace(/{{([A-Za-z0-0_-]+?)}}/g, (match, property) => {
      return properties[property];
    });
  };

  let draw;
  // Unless drawing_enabled is explicitly set to false, we assume we should
  // instantiate the draw plugin.
  if (options.drawing_enabled !== false) {
    draw = new MapboxDraw({
      displayControlsDefault: false,
      userProperties: true,
      // These data-driven styles are used for styling geometry created with the
      // draw plugin.
      // https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/EXAMPLES.md
      styles: [
        // Polygon fill: selected.
        {
          id: "gl-draw-polygon-fill-active",
          type: "fill",
          filter: [
            "all",
            ["==", "$type", "Polygon"],
            ["!=", "mode", "static"],
            ["==", "active", "true"],
          ],
          paint: {
            "fill-color": [
              "case",
              // The user_ prefix is set automatically by the draw plugin.
              ["has", `user_${constants.FILL_COLOR_PROPERTY_NAME}`],
              ["get", `user_${constants.FILL_COLOR_PROPERTY_NAME}`],
              constants.DRAW_DEFAULT_FILL_COLOR,
            ],
            "fill-opacity": [
              "case",
              ["has", `user_${constants.FILL_OPACITY_PROPERTY_NAME}`],
              ["get", `user_${constants.FILL_OPACITY_PROPERTY_NAME}`],
              constants.DRAW_DEFAULT_FILL_OPACITY,
            ],
          },
        },
        // Polygon outline: selected.
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "Polygon"],
            ["!=", "mode", "static"],
            ["==", "active", "true"],
          ],
          "line-cap": "round",
          layout: {
            "line-join": "round",
          },
          paint: {
            "line-color": [
              "case",
              ["has", `user_${constants.LINE_COLOR_PROPERTY_NAME}`],
              ["get", `user_${constants.LINE_COLOR_PROPERTY_NAME}`],
              constants.DRAW_DEFAULT_LINE_COLOR,
            ],
            "line-opacity": [
              "case",
              ["has", `user_${constants.LINE_OPACITY_PROPERTY_NAME}`],
              ["get", `user_${constants.LINE_OPACITY_PROPERTY_NAME}`],
              constants.DRAW_DEFAULT_LINE_OPACITY,
            ],
            "line-width": 3,
          },
        },
        // Linestring: selected.
        {
          id: "gl-draw-line-active",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "LineString"],
            ["!=", "mode", "static"],
            ["==", "active", "true"],
          ],
          paint: {
            "line-color": [
              "case",
              ["has", `user_${constants.LINE_COLOR_PROPERTY_NAME}`],
              ["get", `user_${constants.LINE_COLOR_PROPERTY_NAME}`],
              constants.DRAW_DEFAULT_LINE_COLOR,
            ],
            "line-opacity": [
              "case",
              ["has", `user_${constants.LINE_OPACITY_PROPERTY_NAME}`],
              ["get", `user_${constants.LINE_OPACITY_PROPERTY_NAME}`],
              constants.DRAW_DEFAULT_LINE_OPACITY,
            ],
            "line-width": 3,
          },
        },
        // Vertex point halos.
        {
          id: "gl-draw-polygon-and-line-vertex-halo-active",
          type: "circle",
          filter: [
            "all",
            ["==", "meta", "vertex"],
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "circle-radius": 7,
            "circle-color": "#FFF",
          },
        },
        // Vertex points.
        {
          id: "gl-draw-polygon-and-line-vertex-active",
          type: "circle",
          filter: [
            "all",
            ["==", "meta", "vertex"],
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "circle-radius": 5,
            "circle-color": "#D20C0C",
          },
        },
        // Line segment midpoints.
        {
          id: "gl-draw-polygon-midpoint",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
          paint: {
            "circle-color": "#D20C0C",
            "circle-radius": 3,
          },
        },
        // Points: selected.
        {
          id: "gl-draw-marker-active",
          type: "symbol",
          filter: [
            "all",
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
            ["==", "active", "true"],
          ],
          layout: {
            "icon-image": [
              "get",
              `user_${constants.MARKER_ICON_PROPERTY_NAME}`,
            ],
            "icon-allow-overlap": true,
          },
        },
        // Points: unselected.
        {
          id: "gl-draw-marker-inactive",
          type: "symbol",
          filter: [
            "all",
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
            ["==", "active", "false"],
          ],
          layout: {
            "icon-image": [
              "get",
              `user_${constants.MARKER_ICON_PROPERTY_NAME}`,
            ],
            "icon-allow-overlap": true,
          },
        },

        // Linestring: unselected.
        {
          id: "gl-draw-line-inactive",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "LineString"],
            ["!=", "mode", "static"],
            ["==", "active", "false"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": [
              "case",
              ["has", `user_${constants.LINE_COLOR_PROPERTY_NAME}`],
              ["get", `user_${constants.LINE_COLOR_PROPERTY_NAME}`],
              constants.DRAW_DEFAULT_LINE_COLOR,
            ],
            "line-opacity": [
              "case",
              ["has", `user_${constants.LINE_OPACITY_PROPERTY_NAME}`],
              ["get", `user_${constants.LINE_OPACITY_PROPERTY_NAME}`],
              constants.DRAW_DEFAULT_LINE_OPACITY,
            ],
            "line-width": 3,
          },
        },
        // Polygon fill: unselected.
        {
          id: "gl-draw-polygon-fill-inactive",
          type: "fill",
          filter: [
            "all",
            ["==", "$type", "Polygon"],
            ["!=", "mode", "static"],
            ["==", "active", "false"],
          ],
          paint: {
            "fill-color": [
              "case",
              ["has", `user_${constants.FILL_COLOR_PROPERTY_NAME}`],
              ["get", `user_${constants.FILL_COLOR_PROPERTY_NAME}`],
              constants.DRAW_DEFAULT_FILL_COLOR,
            ],
            "fill-opacity": [
              "case",
              ["has", `user_${constants.FILL_OPACITY_PROPERTY_NAME}`],
              ["get", `user_${constants.FILL_OPACITY_PROPERTY_NAME}`],
              constants.DRAW_DEFAULT_FILL_OPACITY,
            ],
          },
        },
        // Polygon outline: unselected.
        {
          id: "gl-draw-polygon-stroke-inactive",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "Polygon"],
            ["!=", "mode", "static"],
            ["==", "active", "false"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": [
              "case",
              ["has", `user_${constants.LINE_COLOR_PROPERTY_NAME}`],
              ["get", `user_${constants.LINE_COLOR_PROPERTY_NAME}`],
              constants.DRAW_DEFAULT_LINE_COLOR,
            ],
            "line-opacity": [
              "case",
              ["has", `user_${constants.LINE_OPACITY_PROPERTY_NAME}`],
              ["get", `user_${constants.LINE_OPACITY_PROPERTY_NAME}`],
              constants.DRAW_DEFAULT_LINE_OPACITY,
            ],
            "line-width": 3,
          },
        },
      ],
    });
    map.addControl(draw);
  }

  map.addControl(
    new mapboxgl.NavigationControl(options.control),
    options.control.position,
  );

  return AbstractMapFactory({
    on: ({ event, callback }) => {
      let internalCallback;
      switch (event) {
        case "layer:loaded":
          event = "data";
          internalCallback = data => {
            return (
              data.dataType === "source" &&
              map.isSourceLoaded(data.sourceId) &&
              callback(data.sourceId)
            );
          };
          break;
        case "layer:error":
          event = "error";
          internalCallback = data => data.sourceId && callback(data.sourceId);
          break;
        default:
          internalCallback = callback;
          break;
      }

      map.on(event, internalCallback);
    },

    off: (event, callback) => {
      map.off(event, callback);
    },

    onLayerEvent: (event, layerId, callback, context) => {
      callback = callback.bind(context);
      map.on(event, layerId, callback);
    },

    bindPlaceLayerEvents: (eventNames, layerId, callback) => {
      eventNames.forEach(eventName => {
        layersCache[layerId].forEach(mapProviderLayer => {
          let targetLayer = null;
          !mapProviderLayer.id.includes(CLUSTER_LAYER_IDENTIFIER) &&
            map.on(eventName, mapProviderLayer.id, evt => {
              if (eventName === "click" || eventName === "touchstart") {
                // For click and touchstart events, we query rendered features
                // here to obtain a single array of layers below the clicked-on
                // point. The first entry in this array corresponds to the
                // topmost rendered feature. We skip this work for other events
                // (like mouseenter), since we don't make use of information
                // about the layer under the cursor in those cases.
                targetLayer = map.queryRenderedFeatures([
                  evt.point.x,
                  evt.point.y,
                ])[0];
              }

              callback(targetLayer);
            });
        });
      });
    },

    addControl: (control, position) => {
      map.addControl(control, position);
    },

    addCustomControls: ({
      panels,
      setLeftSidebarExpanded,
      setLeftSidebarComponent,
      position,
    }) => {
      panels.forEach(panel => {
        map.addControl(
          new CustomControl({
            setLeftSidebarExpanded: setLeftSidebarExpanded,
            setLeftSidebarComponent: setLeftSidebarComponent,
            ariaLabel: panel.ariaLabel,
            iconClass: panel.icon,
            component: panel.component,
          }),
          position,
        );
      });
    },

    setCursor: style => {
      map.getCanvas().style.cursor = style;
    },

    drawStartPolygon: () => {
      draw.changeMode(draw.modes.DRAW_POLYGON);
    },

    drawStartPolyline: () => {
      draw.changeMode(draw.modes.DRAW_LINE_STRING);
    },

    drawStartMarker: () => {
      draw.changeMode(draw.modes.DRAW_POINT);
    },

    drawDeleteGeometry: () => {
      draw.deleteAll();
    },

    drawAddGeometry: geometry => {
      return draw.add(geometry);
    },

    drawSetFeatureProperty: (id, property, value) => {
      // NOTE: This check is necessary due to a potential race condition due to
      // mixed use of Redux state and event listeners in MainMap. Moving all of
      // our map event listeners to Redux should resolve this issue.
      // See: https://github.com/jalMogo/mgmt/issues/101
      draw.get(id) && draw.setFeatureProperty(id, property, value);
      draw.set(draw.getAll());
    },

    getMap: () => {
      return map;
    },

    getGeolocateControl: () => {
      return new mapboxgl.GeolocateControl();
    },

    getCanvas: () => {
      return map.getCanvas();
    },

    getStyle: () => {
      return map.getStyle();
    },

    queryRenderedFeatures: (geometry, options = {}) => {
      return map.queryRenderedFeatures(geometry, options);
    },

    makeLngLatBounds: (lng, lat) => {
      return new mapboxgl.LngLatBounds(lng, lat);
    },

    fitBounds: (bounds, options) => {
      setTimeout(() => {
        map.fitBounds(bounds, options);
      }, 0);
    },

    fitLineStringCoords: (coordinates, options) => {
      // https://www.mapbox.com/mapbox-gl-js/example/zoomto-linestring
      setTimeout(() => {
        map.fitBounds(
          coordinates.reduce(
            (bounds, coord) => bounds.extend(coord),
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]),
          ),
          options,
        );
      }, 0);
    },

    fitPolygonCoords: (coordinates, options) => {
      // https://www.mapbox.com/mapbox-gl-js/example/zoomto-linestring
      setTimeout(() => {
        map.fitBounds(
          coordinates[0].reduce(
            (bounds, coord) => bounds.extend(coord),
            new mapboxgl.LngLatBounds(coordinates[0][0], coordinates[0][0]),
          ),
          options,
        );
      }, 0);
    },

    hasLayer: layerId => {
      return !!map.getLayer(layerId);
    },

    addLayer: async ({ layer, isBasemap, layerStatuses, mapConfig }) => {
      if (!layersCache[layer.id]) {
        if (layer.is_topmost_layer) {
          topmostLayerId = layer.id;
        }

        switch (layer.type) {
          case "mapbox-style":
            addMapboxStyle(layer, layerStatuses, mapConfig);
            return;
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
          case "place":
            createGeoJSONLayer(layer);
            break;
        }
      }

      if (isBasemap && map.getStyle().name !== DEFAULT_STYLE_NAME) {
        // If we're loading a basemap, check to see if the prior basemap was
        // a Mapbox style. If so, reset the map's style and recover all
        // existing sources and layers that were not affiliated with the
        // Mapbox style.
        const styleLoadCallback = () => {
          Object.entries(layerStatuses)
            .filter(([layerId, layerStatus]) => layerStatus.isVisible)
            .forEach(([layerId, layerStatus]) => {
              addInternalLayers(layerId, layerStatus.isBasemap);
            });

          floatSymbolLayersToTop();
          map.off("style.load", styleLoadCallback);
        };
        map.on("style.load", styleLoadCallback);
        map.setStyle(defaultStyle, {
          diff: false,
        });
      } else {
        // These isStyleLoaded() checks prevent an issue where layers are added
        // to a style before it's ready. This can occur when a Mapbox style is
        // the default visible basemap and other layers are also visible by
        // default. In this case the addMapboxStyle() method above assumes
        // responsibility for adding other default visible layers to the map,
        // after the Mapbox style has finished loading.
        map.isStyleLoaded() && addInternalLayers(layer.id, isBasemap);
        map.isStyleLoaded() && floatSymbolLayersToTop();
      }

      // Ensure that the layer designated topmost is moved to the top of the
      // layer stack.
      layersCache[topmostLayerId] &&
        layersCache[topmostLayerId].forEach(mapboxLayer =>
          map.moveLayer(mapboxLayer.id),
        );
    },

    remove: () => {
      map.remove();
    },

    removeLayer: layer => {
      layer &&
        layersCache[layer.id] &&
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

    setFeatureFilters: ({ featureFilters, groupId, targetLayer }) => {
      featureFilters = featureFilters.filter(
        featureFilter => featureFilter.groupId === groupId,
      );

      const features = map
        .getSource(targetLayer)
        .serialize()
        .data.features.map(feature => {
          feature.properties[constants.IS_HIDDEN_BY_FILTERS] =
            featureFilters.length > 0 &&
            !featureFilters.find(
              featureFilter =>
                feature.properties[featureFilter.attribute] ===
                featureFilter.value,
            );

          return feature;
        });
      map
        .getSource(targetLayer)
        .setData({ type: "FeatureCollection", features: features });
    },

    updateLayerData: (sourceId, newData) => {
      map.getSource(sourceId) && map.getSource(sourceId).setData(newData);
    },

    // TODO: Support multiple focus features at once.
    focusPlaceLayerFeatures: (sourceId, placeLayerFeatures) => {
      ensureFocusedSource();
      map.getSource(FOCUSED_SOURCE_IDENTIFIER).setData(placeLayerFeatures);
    },

    unfocusAllPlaceLayerFeatures: sourceId => {
      map.getSource(FOCUSED_SOURCE_IDENTIFIER) &&
        map.getSource(FOCUSED_SOURCE_IDENTIFIER).setData(EMPTY_GEOJSON);
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
      requestAnimationFrame(() => {
        map.easeTo(options);
      });
    },

    jumpTo: options => {
      map.jumpTo(options);
    },

    flyTo: options => {
      requestAnimationFrame(() => {
        map.flyTo(options);
      });
    },

    invalidateSize: () => {
      map.resize();
    },
  });
};
