import PropTypes from "prop-types";
import { FlyToInterpolator } from "react-map-gl";

const interpolator = new FlyToInterpolator();

// Selectors:
export const mapViewportSelector = state => state.mapAlt.viewport;
export const mapStyleSelector = state => state.mapAlt.style;
export const sourcesStatusSelector = state => state.mapAlt.sourcesStatus;
export const layerGroupsStatusSelector = state =>
  state.mapAlt.layerGroupsStatus;

// Actions:
const UPDATE_VIEWPORT = "map-alt/UPDATE_VIEWPORT";
const UPDATE_STYLE = "map-alt/UPDATE_STYLE";
const LOAD_LAYER_GROUPS_STATUS = "map-alt/LOAD_LAYER_GROUPS_STATUS";
const UPDATE_LAYER_GROUP_STATUS = "map-alt/UPDATE_LAYER_GROUP_STATUS";
const UPDATE_MAP_GEOJSON_SOURCE = "map-alt/UPDATE_MAP_GEOJSON_SOURCE";
const LOAD_STYLE_AND_METADATA = "map-alt/LOAD_STYLE_AND_METADATA";
const UPDATE_SOURCE_STATUS = "map-alt/UPDATE_SOURCE_STATUS";

// Action creators:
export function loadLayerGroupsStatus(groupIds) {
  return {
    type: LOAD_LAYER_GROUPS_STATUS,
    // We initialize all layers to have a status of "unloaded".
    payload: groupIds.reduce(
      (statuses, id) => ({
        ...statuses,
        [id]: "unloaded",
      }),
      {},
    ),
  };
}

// Layer group load status terminology:
// "unloaded": The map has not yet begun to fetch data for any source consumed
//     by this layer group.
// "loading": The map has begun fetching data for one or more sources consumed
//     by this layer group, but has not finished.
// "loaded": All data for all sources consumed by this layer group have been 
//     fetched. Rendering may or may not be in progress.
// "error": An error occurred when fetching data for one or more sources 
//     consumed by this layer group. Note that an "error" status will take
//     precedence over a "loading" status. So, if one source consumed by a
//     layer group has a load status of "loading" and another has a load status
//     of "error", the status of the layer group will be "error".
export function updateLayerGroupsStatus(groupId, status) {
  return {
    type: UPDATE_LAYER_GROUP_STATUS,
    payload: { groupId, status },
  };
}

export function updateSourceStatus(sourceId, status) {
  return {
    type: UPDATE_SOURCE_STATUS,
    payload: { sourceId, status },
  };
}

export function updateMapViewport(viewport) {
  return { type: UPDATE_VIEWPORT, payload: viewport };
}

export function updateMapStyle(style) {
  return { type: UPDATE_STYLE, payload: style };
}

export function updateMapGeoJSONSourceData(sourceId, sourceData) {
  return {
    type: UPDATE_MAP_GEOJSON_SOURCE,
    payload: {
      sourceId,
      sourceData,
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

export function loadMapStyle(mapConfig, datasetsConfig) {
  const style = {
    sources: {
      ...mapConfig.mapboxSources,
      ...datasetsConfig.reduce(
        (memo, config) => ({
          ...memo,
          // Add an empty GeoJSON source for each dataset of Places declared in
          // the config, namespaced by its slug.
          [config.slug]: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          },
        }),
        {},
      ),
    },
    // Preprocess the layers array such that we accommodate Mapseed-specific
    // map features, such as default visibility, focused styling, etc.
    layers: mapConfig.layerGroups
      .map(layerGroup => {
        const layers = layerGroup.mapboxLayers.map(layer => ({
          ...layer,
          layout: {
            ...layer.layout,
            // Set initial layer visisbility.
            visibility: layerGroup.visibleDefault ? "visible" : "none",
          },
        }));

        const focusedLayers = layerGroup.mapboxFocusedLayers
          ? layerGroup.mapboxFocusedLayers.map(focusedLayer => ({
              layout: {
                ...focusedLayer.layout,
                visibility: "none",
              },
              filter: appendFilters(focusedLayer.filter, [
                "==",
                ["get", "__mapseed-is-focused__"],
                true,
              ]),
              ...focusedLayer,
            }))
          : [];

        return layers.concat(focusedLayers);
      })
      .reduce((flat, toFlatten) => flat.concat(toFlatten), []),
  };

  const layerGroupsStatus = mapConfig.layerGroups.reduce(
    (memo, layerGroup) => ({
      ...memo,
      [layerGroup.id]: {
        isBasemap: !!layerGroup.basemap,
        isVisible: !!layerGroup.visibleDefault,
        // Sources which this layerGroup consumes:
        sourceIds: [
          ...new Set(
            layerGroup.mapboxLayers.map(mapboxLayer => mapboxLayer.source),
          ),
        ],
      },
    }),
    {},
  );

  const sourcesStatus = Object.keys(style.sources).reduce(
    (memo, sourceId) => ({
      ...memo,
      [sourceId]: "unloaded",
    }),
    {},
  );

  return {
    type: LOAD_STYLE_AND_METADATA,
    payload: { style, sourcesStatus, layerGroupsStatus },
  };
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
  layerGroupsStatus: {},
  sourcesStatus: {},
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_MAP_GEOJSON_SOURCE:
      return {
        ...state,
        style: {
          ...state.style,
          sources: {
            ...state.style.sources,
            [action.payload.sourceId]: {
              ...state.style.sources[action.payload.sourceId],
              data: {
                ...state.style.sources[action.payload.sourceId].data,
                features: state.style.sources[
                  action.payload.sourceId
                ].data.features.concat(action.payload.sourceData),
              },
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
    case LOAD_STYLE_AND_METADATA:
      return {
        ...state,
        style: {
          ...state.style,
          ...action.payload.style,
        },
        layerGroupsStatus: {
          ...state.layerGroupsStatus,
          ...action.payload.layerGroupsStatus,
        },
        sourcesStatus: {
          ...state.sourcesStatus,
          ...action.payload.sourcesStatus,
        },
      };
    case UPDATE_SOURCE_STATUS:
      return {
        ...state,
        sourcesStatus: {
          ...state.sourcesStatus,
          [action.payload.sourceId]: action.payload.status,
        },
      };
    case UPDATE_LAYER_GROUP_STATUS:
      return {
        ...state,
        layerGroupsStatus: {
          ...state.layerGroupsStatus,
          [action.payload.groupId]: {
            ...state.layerGrouspsStatus[action.payload.groupId],
            status: action.payload.status,
          },
        },
      };
    default:
      return state;
  }
}
