import PropTypes from "prop-types";
import { FlyToInterpolator } from "react-map-gl";

import { easeInOutCubic } from "../../utils/scroll-helpers";

// Selectors:
export const mapViewportSelector = state => state.map.viewport;
export const mapStyleSelector = state => state.map.style;
export const sourcesMetadataSelector = state => state.map.sourcesMetadata;
export const layerGroupsMetadataSelector = state =>
  state.map.layerGroupsMetadata;
export const interactiveLayerIdsSelector = state =>
  state.map.interactiveLayerIds;
export const setMapSizeValiditySelector = state => state.map.isMapSizeValid;
export const mapDraggingSelector = state => state.map.isMapDragging;
export const mapDraggedSelector = state => state.map.isMapDragged;
export const mapCenterpointSelector = state => ({
  latitude: state.map.viewport.latitude,
  longitude: state.map.viewport.longitude,
});

// Actions:
const UPDATE_VIEWPORT = "map/UPDATE_VIEWPORT";
const UPDATE_STYLE = "map/UPDATE_STYLE";
const UPDATE_LAYER_GROUP_LOAD_STATUS = "map/UPDATE_LAYER_GROUP_LOAD_STATUS";
const UPDATE_GEOJSON_FEATURES = "map/UPDATE_GEOJSON_FEATURES";
const LOAD_STYLE_AND_METADATA = "map/LOAD_STYLE_AND_METADATA";
const UPDATE_SOURCE_LOAD_STATUS = "map/UPDATE_SOURCE_LOAD_STATUS";
const UPDATE_LAYER_GROUP_VISIBILITY = "map/UPDATE_LAYER_GROUP_VISIBILITY";
const UPDATE_FOCUSED_GEOJSON_FEATURES = "map/UPDATE_FOCUSED_GEOJSON_FEATURES";
const REMOVE_FOCUSED_GEOJSON_FEATURES = "map/REMOVE_FOCUSED_GEOJSON_FEATURES";
const UPDATE_MAP_DRAGGED = "map/UPDATE_MAP_DRAGGED";
const UPDATE_MAP_DRAGGING = "map/UPDATE_MAP_DRAGGING";
const REMOVE_GEOJSON_FEATURE = "map/REMOVE_GEOJSON_FEATURE";

// Layer group load status terminology:
// ------------------------------------
// "unloaded": The map has not yet begun to fetch data for any source consumed
// "loading": The map has begun fetching data for one or more sources consumed
//     by this layer group.
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

export function removeFocusedGeoJSONFeatures() {
  return {
    type: REMOVE_FOCUSED_GEOJSON_FEATURES,
    payload: null,
  };
}

export function updateFocusedGeoJSONFeatures(features) {
  return {
    type: UPDATE_FOCUSED_GEOJSON_FEATURES,
    payload: features,
  };
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
  return {
    type: UPDATE_VIEWPORT,
    payload: { viewport, scrollZoomAroundCenter: false },
  };
}

export function updateMapViewportFromReactMapGL(
  viewport,
  scrollZoomAroundCenter = false,
) {
  // We have a special action creator for viewport updates that originate from
  // react-map-gl. The reason for this is that react-map-gl seems to cache
  // the width and height of the map container at the beginning of a
  // transition. If the viewport change that initiated the transition also
  // changed the width and/or height (for example when a Place is clicked and
  // the map resizes to make way for the content panel), then react-map-gl will
  // immediately undo the width and height change. The result of this is yet
  // another version of the off-center bug.
  //
  // So, we strip out the height and width from any viewport changes
  // originating from react-map-gl. There should never be a situation where
  // react-map-gl should be setting the width or height of the map container.
  const { width, height, ...rest } = viewport;

  return {
    type: UPDATE_VIEWPORT,
    payload: { viewport: rest, scrollZoomAroundCenter },
  };
}

export function updateMapStyle(style) {
  return { type: UPDATE_STYLE, payload: style };
}

export function updateMapDragged(isDragged) {
  return { type: UPDATE_MAP_DRAGGED, payload: isDragged };
}

export function updateMapDragging(isDragging) {
  return { type: UPDATE_MAP_DRAGGING, payload: isDragging };
}

export function updateGeoJSONFeatures({
  sourceId,
  newFeatures,
  mode = "append",
}) {
  return {
    type: UPDATE_GEOJSON_FEATURES,
    payload: {
      mode,
      sourceId,
      newFeatures,
    },
  };
}

export function removeGeoJSONFeature(sourceId, featureId) {
  return {
    type: REMOVE_GEOJSON_FEATURE,
    payload: { sourceId, featureId },
  };
}

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
      // Add an empty GeoJSON source that will hold all features that have
      // become "focused" (i.e. because the user clicked on a Place). We
      // maintain a separate source for focused features because reflowing the
      // data to a full source is expensive and produces a noticeable lag as
      // the user clicks around Places on the map.
      //
      // One drawback to this approach is the original, unfocused feature
      // remains on the map. We can mitigate this a bit by ensuring that
      // focused layers always render on top of non-focused layers.
      "__mapseed-focused-source__": {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      },
    },
    layers: mapConfig.layerGroups
      .map(lg => ({
        ...lg,
        mapboxLayers: lg.mapboxLayers.map(mbl => ({
          ...mbl,
          layout: {
            ...mbl.layout,
            // Set default visibility.
            visibility: lg.visibleDefault ? "visible" : "none",
          },
        })),
      }))
      .reduce((memo, lg) => memo.concat(lg.mapboxLayers), [])
      // Add on layers representing the styling of focused geometry at the top
      // of the layer stack so focused geometry renders topmost.
      .concat(
        mapConfig.layerGroups
          .reduce((memo, lg) => memo.concat(lg.mapboxFocusedLayers || []), [])
          .map(mbl => ({
            ...mbl,
            // All focused layers will have the same source. Focused layers
            // will only render geometry if the focused source has been
            // populated with features to focus.
            source: "__mapseed-focused-source__",
            layout: {
              ...mbl.layout,
              visibility: "visible",
            },
          })),
      ),
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

  const sourcesMetadata = Object.keys(style.sources).reduce(
    (memo, sourceId) => ({
      ...memo,
      [sourceId]: {
        loadStatus: "unloaded",
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
  minZoom: PropTypes.number.isRequired,
  maxZoom: PropTypes.number.isRequired,
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
    width: 0,
    height: 0,
    minZoom: 1,
    maxZoom: 18,
    transitionInterpolator: new FlyToInterpolator(),
    transitionEasing: easeInOutCubic,
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
  isMapSizeValid: false,
  isMapDragged: false,
  isMapDragging: false,
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_GEOJSON_FEATURES:
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
                features:
                  action.payload.mode === "replace"
                    ? action.payload.newFeatures
                    : state.style.sources[
                        action.payload.sourceId
                      ].data.features.concat(action.payload.newFeatures),
              },
            },
          },
        },
      };
    case REMOVE_GEOJSON_FEATURE:
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
                ].data.features.filter(
                  feature => feature.id !== action.payload.featureId,
                ),
              },
            },
          },
        },
      };

    case REMOVE_FOCUSED_GEOJSON_FEATURES:
      return {
        ...state,
        style: {
          ...state.style,
          sources: {
            ...state.style.sources,
            "__mapseed-focused-source__": {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: [],
              },
            },
          },
        },
      };
    case UPDATE_FOCUSED_GEOJSON_FEATURES:
      return {
        ...state,
        style: {
          ...state.style,
          sources: {
            ...state.style.sources,
            "__mapseed-focused-source__": {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: action.payload,
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
          ...action.payload.viewport,
          // NOTE: This is a fix for an apparent bug in react-map-gl.
          // See: https://github.com/uber/react-map-gl/issues/630
          bearing: isNaN(action.payload.viewport.bearing)
            ? state.viewport.bearing
            : action.payload.viewport.bearing,
          // These checks support a "scroll zoom around center" feature (in
          // which a zoom of the map will not change the centerpoint) that is
          // not exposed by react-map-gl. These checks are pretty convoluted,
          // though, so it would be great if react-map-gl could just
          // incorporate the scroll zoom around center option natively.
          // See: https://github.com/uber/react-map-gl/issues/515
          latitude:
            action.payload.scrollZoomAroundCenter &&
            action.payload.viewport.zoom !== state.viewport.zoom
              ? state.viewport.latitude
              : action.payload.viewport.latitude
                ? action.payload.viewport.latitude
                : state.viewport.latitude,
          longitude:
            action.payload.scrollZoomAroundCenter &&
            action.payload.viewport.zoom !== state.viewport.zoom
              ? state.viewport.longitude
              : action.payload.viewport.longitude
                ? action.payload.viewport.longitude
                : state.viewport.longitude,
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
              action.payload.isVisible &&
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
              // If the payload layer is a basemap and the layer we're checking
              // against is also a basemap, turn that layer off. Only do this
              // if the incoming request is to turn a layer on; otherwise, a
              // request to turn a basemap off (for example from the code that
              // sets layer visibility for a form stage) will turn off all other
              // basemaps as well.
              action.payload.isVisible &&
              state.layerGroupsMetadata[action.payload.layerGroupId]
                .isBasemap &&
              state.basemapLayerIds.includes(layer.id) &&
              !state.layerGroupsMetadata[
                action.payload.layerGroupId
              ].layerIds.includes(layer.id)
            ) {
              // If this layer group is a basemap, check to see if this layer
              // belongs to another basemap. If so, switch it off.
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
    case UPDATE_MAP_DRAGGED:
      return {
        ...state,
        isMapDragged: action.payload,
      };
    case UPDATE_MAP_DRAGGING:
      return {
        ...state,
        isMapDragging: action.payload,
      };
    default:
      return state;
  }
}
