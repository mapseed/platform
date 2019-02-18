import PropTypes from "prop-types";
import { FlyToInterpolator } from "react-map-gl";

const interpolator = new FlyToInterpolator();

// Selectors:
export const mapViewportSelector = state => state.map.viewport;
export const mapStyleSelector = state => state.map.style;
export const sourcesMetadataSelector = state => state.map.sourcesMetadata;
export const layerGroupsMetadataSelector = state =>
  state.map.layerGroupsMetadata;
export const interactiveLayerIdsSelector = state =>
  state.map.interactiveLayerIds;
export const mapDraggingSelector = state => false; // TODO
export const mapDraggedSelector = state => false; // TODO

// Actions:
const UPDATE_VIEWPORT = "map/UPDATE_VIEWPORT";
const UPDATE_STYLE = "map/UPDATE_STYLE";
const UPDATE_LAYER_GROUP_LOAD_STATUS = "map/UPDATE_LAYER_GROUP_LOAD_STATUS";
const UPDATE_MAP_GEOJSON_SOURCE = "map/UPDATE_MAP_GEOJSON_SOURCE";
const LOAD_STYLE_AND_METADATA = "map/LOAD_STYLE_AND_METADATA";
const UPDATE_SOURCE_LOAD_STATUS = "map/UPDATE_SOURCE_LOAD_STATUS";
const UPDATE_LAYER_GROUP_VISIBILITY = "map/UPDATE_LAYER_GROUP_VISIBILITY";

// Layer group load status terminology:
// ------------------------------------
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
export function updateLayerGroupLoadStatus(groupId, loadStatus) {
  return {
    type: UPDATE_LAYER_GROUP_LOAD_STATUS,
    payload: { groupId, loadStatus },
  };
}

export function setMapSizeValidity(isValidSize) {
  return {
    type: "TEMP",
    payload: {},
  }; // TODO
}

export function updateLayerGroupVisibility(layerGroupId, isVisible) {
  return {
    type: UPDATE_LAYER_GROUP_VISIBILITY,
    payload: { layerGroupId, isVisible },
  };
}

export function updateSourceLoadStatus(sourceId, loadStatus) {
  return {
    type: UPDATE_SOURCE_LOAD_STATUS,
    payload: { sourceId, loadStatus },
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
    layers: mapConfig.layerGroups
      //.filter(lg => !!lg.visibleDefault)
      .map(lg => {
        return (lg.mapboxFocusedLayers
          ? lg.mapboxLayers.concat(
              lg.mapboxFocusedLayers.map(mbfl => ({
                ...mbfl,
                filter: appendFilters(mbfl.filter, [
                  "==",
                  ["get", "__mapseed-is-focused__"],
                  true,
                ]),
              })),
            )
          : lg.mapboxLayers
        ).map(layer => ({
          ...layer,
          layout: {
            ...layer.layout,
            visibility: lg.visibleDefault ? "visible" : "none",
          },
        }));
      })
      .reduce((flat, toFlatten) => flat.concat(toFlatten), []),
  };

  const layerGroupsMetadata = mapConfig.layerGroups.reduce(
    (memo, layerGroup) => ({
      ...memo,
      [layerGroup.id]: {
        isBasemap: !!layerGroup.basemap,
        isVisible: !!layerGroup.visibleDefault,
        // Mapbox layer ids which make up this layerGroup:
        layerIds: layerGroup.mapboxLayers
          .concat(layerGroup.mapboxFocusedLayers || [])
          .reduce((flat, toFlatten) => flat.concat(toFlatten), [])
          .map(layer => layer.id),
        // Source ids which this layerGroup consumes:
        sourceIds: [
          ...new Set(
            layerGroup.mapboxLayers.map(mapboxLayer => mapboxLayer.source),
          ),
        ],
      },
    }),
    {},
  );

  const defaultVisibleLayerGroups = mapConfig.layerGroups.filter(
    lg => !!lg.visibleDefault,
  );
  const sourcesMetadata = Object.keys(style.sources).reduce(
    (memo, sourceId) => ({
      ...memo,
      [sourceId]: {
        loadStatus: "unloaded",
        // An "active" source is a source that is consumed by at least one
        // visible layer. On map load, only sources consumed by default visible
        // layers will be active, so indicate that here.
        isActive: defaultVisibleLayerGroups.some(lg =>
          lg.mapboxLayers.some(mbl => mbl.source === sourceId),
        ),
        // Layer group ids containing layers which consume this source:
        layerGroupIds: mapConfig.layerGroups
          .filter(lg =>
            lg.mapboxLayers
              .concat(lg.mapboxFocusedLayers || [])
              .reduce((flat, toFlatten) => flat.concat(toFlatten), [])
              .some(mbl => mbl.source === sourceId),
          )
          .map(lg => lg.id),
      },
    }),
    {},
  );

  const basemapLayerIds = mapConfig.layerGroups
    .filter(lg => !!lg.basemap)
    .map(lg => lg.mapboxLayers.concat(lg.mapboxFocusedLayers || []))
    .reduce((flat, toFlatten) => flat.concat(toFlatten), [])
    .map(layer => layer.id);

  const interactiveLayerIds = mapConfig.layerGroups
    .filter(lg => !!lg.interactive)
    .map(lg => lg.mapboxLayers.concat(lg.mapboxFocusedLayers || []))
    .reduce((flat, toFlatten) => flat.concat(toFlatten), [])
    .map(layer => layer.id);

  return {
    type: LOAD_STYLE_AND_METADATA,
    payload: {
      style,
      sourcesMetadata,
      layerGroupsMetadata,
      basemapLayerIds,
      interactiveLayerIds,
    },
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
  layerGroupsMetadata: {},
  sourcesMetadata: {},
  basemapLayerIds: [],
  interactiveLayerIds: [],
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
        layerGroupsMetadata: {
          ...state.layerGroupsMetadata,
          ...action.payload.layerGroupsMetadata,
        },
        sourcesMetadata: {
          ...state.sourcesMetadata,
          ...action.payload.sourcesMetadata,
        },
        basemapLayerIds: action.payload.basemapLayerIds,
        interactiveLayerIds: action.payload.interactiveLayerIds,
      };
    case UPDATE_SOURCE_LOAD_STATUS:
      return {
        ...state,
        sourcesMetadata: {
          ...state.sourcesMetadata,
          [action.payload.sourceId]: {
            ...state.sourcesMetadata[action.payload.sourceId],
            loadStatus: action.payload.loadStatus,
          },
        },
      };
    case UPDATE_LAYER_GROUP_LOAD_STATUS:
      return {
        ...state,
        layerGroupsMetadata: {
          ...state.layerGroupsMetadata,
          [action.payload.groupId]: {
            ...state.layerGrouspsMetadata[action.payload.groupId],
            loadStatus: action.payload.loadStatus,
          },
        },
      };
    case UPDATE_LAYER_GROUP_VISIBILITY:
      return {
        ...state,
        layerGroupsMetadata: Object.entries(state.layerGroupsMetadata).reduce(
          (memo, [layerGroupId, metadata]) => {
            let newVisibilityStatus;
            if (
              state.layerGroupsMetadata[action.payload.layerGroupId]
                .isBasemap &&
              metadata.isBasemap &&
              layerGroupId !== action.payload.layerGroupId
            ) {
              // If the layer group in the payload is a basemap, switch off
              // other basemap layer groups.
              newVisibilityStatus = false;
            } else if (layerGroupId === action.payload.layerGroupId) {
              newVisibilityStatus = action.payload.isVisible;
            }

            return {
              ...memo,
              [layerGroupId]: {
                ...metadata,
                isVisible:
                  typeof newVisibilityStatus === "undefined"
                    ? metadata.isVisible
                    : newVisibilityStatus,
              },
            };
          },
          {},
        ),
        // Update active status of sources consumed by this layer group.
        sourcesMetadata: Object.entries(state.sourcesMetadata).reduce(
          (memo, [sourceId, sourceMetadata]) => {
            let newActiveStatus;
            if (
              action.payload.isVisible &&
              state.layerGroupsMetadata[
                action.payload.layerGroupId
              ].sourceIds.includes(sourceId)
            ) {
              // If we're switching a layer group on and this sourceId is
              // consumed by a layer in this layer group, set the source to be
              // active.
              newActiveStatus = true;
            } else if (
              !action.payload.isVisible &&
              !state.sourcesMetadata[sourceId].layerGroupIds.some(
                id => state.layerGroupsMetadata[id].isVisible,
              )
            ) {
              // Otherwise, if we're switching a layer group off and all other
              // layer groups with layers that consume this source are not
              // visible, we can set this source to be inactive.
              newActiveStatus = false;
            }

            return {
              ...memo,
              [sourceId]: {
                ...sourceMetadata,
                isActive:
                  typeof newActiveStatus !== "undefined"
                    ? newActiveStatus
                    : sourceMetadata.isActive,
              },
            };
          },
          {},
        ),
        style: {
          ...state.style,
          // Set visibility on all layers making up this layer group. Also
          // update basemap layer visibility if this layer group is a
          // basemap.
          layers: state.style.layers.map(layer => {
            let newVisibilityStatus;
            if (
              state.layerGroupsMetadata[
                action.payload.layerGroupId
              ].layerIds.includes(layer.id)
            ) {
              // If this layer is part of the layer group, adjust its
              // visibility accordingly.
              newVisibilityStatus = action.payload.isVisible
                ? "visible"
                : "none";
            }
            if (
              state.layerGroupsMetadata[action.payload.layerGroupId]
                .isBasemap &&
              state.basemapLayerIds.includes(layer.id) &&
              !state.layerGroupsMetadata[
                action.payload.layerGroupId
              ].layerIds.includes(layer.id)
            ) {
              // If this layer group is a basemap, check to see if this layer
              // belongs to another basemap. If so, switch it off.
              // TODO: keep layerMetadataStatus in sync with this
              newVisibilityStatus = "none";
            }

            return {
              ...layer,
              layout: {
                ...layer.layout,
                visibility:
                  typeof newVisibilityStatus === "undefined"
                    ? layer.layout.visibility
                    : newVisibilityStatus,
              },
            };
          }),
        },
      };
    default:
      return state;
  }
}
