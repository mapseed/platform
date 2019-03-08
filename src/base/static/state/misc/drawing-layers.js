// These layers support drawing via mapbox-gl-draw.
export default [
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
        ["has", "user_fill"],
        ["get", "user_fill"],
        "#f1f075",
      ],
      "fill-opacity": [
        "case",
        ["has", "user_fill-opacity"],
        ["get", "user_fill-opacity"],
        0.3,
      ],
    },
    layout: {
      visibility: "visible",
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
    layout: {
      "line-cap": "round",
      "line-join": "round",
      visibility: "visible",
    },
    paint: {
      "line-color": [
        "case",
        ["has", "user_stroke"],
        ["get", "user_stroke"],
        "#f86767",
      ],
      "line-opacity": [
        "case",
        ["has", "user_stroke-opacity"],
        ["get", "user_stroke-opacity"],
        0.7,
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
        ["has", "user_stroke"],
        ["get", "user_stroke"],
        "#f86767",
      ],
      "line-opacity": [
        "case",
        ["has", "user_stroke-opacity"],
        ["get", "user_stroke-opacity"],
        0.7,
      ],
      "line-width": 3,
    },
    layout: {
      visibility: "visible",
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
    layout: {
      visibility: "visible",
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
    layout: {
      visibility: "visible",
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
    layout: {
      visibility: "visible",
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
      "icon-image": ["get", "user_marker-symbol"],
      "icon-allow-overlap": true,
      "icon-anchor": "bottom",
      visibility: "visible",
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
      "icon-image": ["get", "user_marker-symbol"],
      "icon-allow-overlap": true,
      "icon-anchor": "bottom",
      visibility: "visible",
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
      visibility: "visible",
    },
    paint: {
      "line-color": [
        "case",
        ["has", "user_stroke"],
        ["get", "user_stroke"],
        "#f86767",
      ],
      "line-opacity": [
        "case",
        ["has", "user_stroke-opacity"],
        ["get", "user_stroke-opacity"],
        0.7,
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
        ["has", "user_fill"],
        ["get", "user_fill"],
        "#f1f075",
      ],
      "fill-opacity": [
        "case",
        ["has", "user_fill-opacity"],
        ["get", "user_fill-opacity"],
        0.3,
      ],
    },
    layout: {
      visibility: "visible",
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
      visibility: "visible",
    },
    paint: {
      "line-color": [
        "case",
        ["has", "user_stroke"],
        ["get", "user_stroke"],
        "#f86767",
      ],
      "line-opacity": [
        "case",
        ["has", "user_stroke-opacity"],
        ["get", "user_stroke-opacity"],
        0.7,
      ],
      "line-width": 3,
    },
  },
];
