import PropTypes from "prop-types";
import { FlyToInterpolator } from "react-map-gl";

const interpolator = new FlyToInterpolator();

// Selectors:
export const mapViewportSelector = state => {
  return state.mapAlt.viewport;
};

export const mapStyleSelector = state => {
  return state.mapAlt.style;
};

// Actions:
const UPDATE_VIEWPORT = "map-alt/UPDATE_VIEWPORT";
const UPDATE_STYLE = "map-alt/UPDATE_STYLE";
const LOAD_SOURCE = "map-alt/LOAD_SOURCE";

// Action creators:
export function updateMapViewport(viewport) {
  return { type: UPDATE_VIEWPORT, payload: viewport };
}

export function updateMapStyle(style) {
  return { type: UPDATE_STYLE, payload: style };
}

export function loadMapSourceData(sourceData, sourceId) {
  return {
    type: LOAD_SOURCE,
    payload: {
      sourceData,
      sourceId,
    },
  };
}

const appendFilters = (existingFilters, ...filtersToAdd) => {
  const newFilters = filtersToAdd.reduce(
    (newFilters, filterToAdd) => [...newFilters, filterToAdd],
    existingFilters ? [existingFilters] : [],
  );

  // If an existing filter does not already start with the logical AND
  // operator "all", we need to prepend it.
  newFilters[0] !== "all" && newFilters.unshift("all");

  return newFilters;
};

export function loadMapStyle(mapConfig) {
  const style = {
    sources: mapConfig.mapboxSources,
    // Preprocess the layers array such that we accommodate Mapseed-specific
    // map features, such as default visibility, focused styling, etc.
    layers: mapConfig.layerGroups
      .map(layerGroup => {
        const layers = layerGroup.mapboxLayers.map(layer => {
          // Set initial layer visisbility.
          layer.layout = {
            ...layer.layout,
            visibility: layerGroup.visibleDefault ? "visible" : "none",
          };

          return layer;
        });

        const focusedLayers = layerGroup.mapboxFocusedLayers
          ? layerGroup.mapboxFocusedLayers.map(focusedLayer => {
              focusedLayer.layout = {
                ...focusedLayer.layout,
                visibility: "none",
              };
              focusedLayer.filter = appendFilters(focusedLayer.filter, [
                "==",
                ["get", "__mapseed-is-focused__"],
                true,
              ]);

              return focusedLayer;
            })
          : [];

        return layers.concat(focusedLayers);
      })
      .reduce((flat, toFlatten) => flat.concat(toFlatten), []),
  };

  return { type: UPDATE_STYLE, payload: style };
}

export const mapViewportPropType = PropTypes.shape({
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  zoom: PropTypes.number,
  pitch: PropTypes.number,
  bearing: PropTypes.number,
  transitionInterpolator: PropTypes.object,
  transitionDuration: PropTypes.number,
  transitionEasing: PropTypes.func,
});

export const mapStylePropType = PropTypes.shape({
  version: PropTypes.number,
  name: PropTypes.string,
  sources: PropTypes.object,
  layers: PropTypes.arrayOf(PropTypes.object),
});

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = {
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
    transitionInterpolator: interpolator,
  },
  style: {
    version: 8,
    name: "Mapseed",
    glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    sprite: `${window.location.protocol}//${
      window.location.host
    }/static/css/images/markers/spritesheet`,
    sources: {},
    layers: [],
  },
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD_SOURCE:
      return {
        ...state,
        style: {
          ...state.style,
          sources: {
            ...state.style.sources,
            [action.payload.sourceId]: {
              ...state.style.sources[action.payload.sourceId],
              data: action.payload.sourceData,
            },
          },
        },
      };
    case UPDATE_VIEWPORT:
      return {
        ...state,
        viewport: {
          ...state.viewport,
          ...action.payload,
          // NOTE: This is a fix for an apparent bug in react-map-gl.
          // See: https://github.com/uber/react-map-gl/issues/630
          bearing: isNaN(action.payload.bearing)
            ? state.viewport.bearing
            : action.payload.bearing,
          height: window.innerHeight,
          width: window.innerWidth,
        },
      };
    case UPDATE_STYLE:
      return {
        ...state,
        style: {
          ...state.style,
          ...action.payload,
        },
      };
    default:
      return state;
  }
}
