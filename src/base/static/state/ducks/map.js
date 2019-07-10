import { createSelector } from "reselect";

import PropTypes from "prop-types";
import { RESET_UI } from "./ui";

////////////////////////////////////////////////////////////////////////////////
// PROPTYPES
////////////////////////////////////////////////////////////////////////////////
export const mapViewportPropType = PropTypes.shape({
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

const filterSliderPropType = PropTypes.shape({
  initialValue: PropTypes.number,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number,
  label: PropTypes.string,
  property: PropTypes.string.isRequired,
  comparator: PropTypes.string.isRequired,
});

export const mapSourcesPropType = PropTypes.objectOf(
  PropTypes.shape({
    type: PropTypes.string.isRequired,
    tiles: PropTypes.array,
    data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
);

export const mapStylePropType = PropTypes.shape({
  version: PropTypes.number,
  name: PropTypes.string,
  sources: mapSourcesPropType,
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      source: PropTypes.string,
      "source-layer": PropTypes.string,
      paint: PropTypes.object,
      layout: PropTypes.shape({
        visibility: PropTypes.string.isRequired,
      }),
    }),
  ),
});

export const layerGroupsPropType = PropTypes.shape({
  byId: PropTypes.objectOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      popupContent: PropTypes.string,
      filterSlider: filterSliderPropType,
      isBasemap: PropTypes.bool,
      isVisible: PropTypes.bool,
      isVisibleDefault: PropTypes.bool,
      // Mapbox layer ids which make up this layerGroup:
      layerIds: PropTypes.arrayOf(PropTypes.string).isRequired,
      // Source ids which this layerGroup consumes:
      sourceIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ),
  allIds: PropTypes.arrayOf(PropTypes.string).isRequired,
});

export const sourcesMetadataPropType = PropTypes.objectOf(
  PropTypes.shape({
    layerGroupIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
);

////////////////////////////////////////////////////////////////////////////////
// SELECTORS:
////////////////////////////////////////////////////////////////////////////////

const getStyle = state => state.map.style;
const getLayers = state => state.map.layers;
export const layerGroupsSelector = state => state.map.layerGroups;
export const mapStyleSelector = createSelector(
  [getStyle, getLayers, layerGroupsSelector],
  (style, layers, layerGroups) => {
    return {
      ...style,
      layers: layers.map(layer => {
        const { groupId, ...mapboxLayer } = layer;
        return {
          ...mapboxLayer,
          layout: {
            ...mapboxLayer.layout,
            visibility: layerGroups.byId[groupId].isVisible
              ? "visible"
              : "none",
          },
        };
      }),
    };
  },
);

export const mapSourcesSelector = state => state.map.style.sources;
export const sourcesMetadataSelector = state => state.map.sourcesMetadata;
export const interactiveLayerIdsSelector = state =>
  state.map.interactiveLayerIds;
export const setMapSizeValiditySelector = state => state.map.isMapSizeValid;
export const mapDraggingOrZoomingSelector = state =>
  state.map.isMapDraggingOrZooming;
export const mapDraggedOrZoomedSelector = state =>
  state.map.isMapDraggedOrZoomed;
export const mapContainerDimensionsSelector = state =>
  state.map.mapContainerDimensions;
export const mapLayerPopupSelector = (layerId, state) => {
  const metadata = Object.values(state.map.layerGroups.byId).find(layerGroup =>
    layerGroup.layerIds.includes(layerId),
  );

  return metadata && metadata.popupContent ? metadata.popupContent : null;
};
// Return information about visible layer groups which are configured to be
// filterable with a slider.
export const filterableLayerGroupsSelector = state =>
  Object.values(state.map.layerGroups.byId).reduce(
    (memo, { filterSlider, layerIds, isVisible }) => {
      return filterSlider && isVisible
        ? [
            ...memo,
            {
              filterSlider,
              layerIds,
            },
          ]
        : memo;
    },
    [],
  );

////////////////////////////////////////////////////////////////////////////////
// ACTIONS:
////////////////////////////////////////////////////////////////////////////////
const UPDATE_STYLE = "map/UPDATE_STYLE";
const UPDATE_FEATURES_IN_GEOJSON_SOURCE =
  "map/UPDATE_FEATURES_IN_GEOJSON_SOURCE";
const UPDATE_FEATURE_IN_GEOJSON_SOURCE = "map/UPDATE_FEATURE_IN_GEOJSON_SOURCE";
const CREATE_FEATURES_IN_GEOJSON_SOURCE =
  "map/CREATE_FEATURES_IN_GEOJSON_SOURCE";
const REMOVE_FEATURE_IN_GEOJSON_SOURCE = "map/REMOVE_FEATURE_IN_GEOJSON_SOURCE";
const LOAD_STYLE_AND_METADATA = "map/LOAD_STYLE_AND_METADATA";
const UPDATE_LAYER_GROUP_VISIBILITY = "map/UPDATE_LAYER_GROUP_VISIBILITY";
const UPDATE_FOCUSED_GEOJSON_FEATURES = "map/UPDATE_FOCUSED_GEOJSON_FEATURES";
const REMOVE_FOCUSED_GEOJSON_FEATURES = "map/REMOVE_FOCUSED_GEOJSON_FEATURES";
const UPDATE_LAYERS = "map/UPDATE_LAYERS";
const UPDATE_MAP_CONTAINER_DIMENSIONS = "map/UPDATE_MAP_CONTAINER_DIMENSIONS";
const UPDATE_LAYER_FILTERS = "map/UPDATE_LAYER_FILTERS";

////////////////////////////////////////////////////////////////////////////////
// ACTION CREATORS:
////////////////////////////////////////////////////////////////////////////////
export function updateLayerFilters(filters) {
  return {
    type: UPDATE_LAYER_FILTERS,
    payload: filters,
  };
}

export function removeFocusedGeoJSONFeatures() {
  return {
    type: REMOVE_FOCUSED_GEOJSON_FEATURES,
    payload: null,
  };
}

export function updateLayers(newLayer) {
  return {
    type: UPDATE_LAYERS,
    payload: newLayer,
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

export function updateMapContainerDimensions(dimensions) {
  return {
    type: UPDATE_MAP_CONTAINER_DIMENSIONS,
    payload: dimensions,
  };
}

export function updateMapStyle(style) {
  return { type: UPDATE_STYLE, payload: style };
}

export function updateFeaturesInGeoJSONSource(sourceId, newFeatures) {
  return {
    type: UPDATE_FEATURES_IN_GEOJSON_SOURCE,
    payload: {
      sourceId,
      newFeatures,
    },
  };
}

export function updateFeatureInGeoJSONSource({ sourceId, featureId, feature }) {
  return {
    type: UPDATE_FEATURE_IN_GEOJSON_SOURCE,
    payload: {
      sourceId,
      featureId,
      feature,
    },
  };
}

export function createFeaturesInGeoJSONSource(sourceId, newFeatures) {
  return {
    type: CREATE_FEATURES_IN_GEOJSON_SOURCE,
    payload: { sourceId, newFeatures },
  };
}

export function removeFeatureInGeoJSONSource(sourceId, featureId) {
  return {
    type: REMOVE_FEATURE_IN_GEOJSON_SOURCE,
    payload: { sourceId, featureId },
  };
}

export function loadMapStyle(mapStyleConfig, datasetsConfig) {
  const style = {
    sources: {
      ...mapStyleConfig.mapboxSources,
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
  };
  const layers = mapStyleConfig.layerGroups
    .map(lg => ({
      ...lg,
      mapboxLayers: lg.mapboxLayers.map(mbl => ({
        ...mbl,
        groupId: lg.id,
      })),
    }))
    .reduce((memo, lg) => memo.concat(lg.mapboxLayers), [])
    // Add on layers representing the styling of focused geometry at the top
    // of the layer stack so focused geometry renders topmost.
    .concat(
      mapStyleConfig.layerGroups
        .reduce(
          (memo, lg) =>
            memo.concat(
              (lg.mapboxFocusedLayers || []).map(focusedLayer => ({
                ...focusedLayer,
                groupId: lg.id,
              })),
            ),
          [],
        )
        .map(mbl => ({
          ...mbl,
          // All focused layers will have the same source. Focused layers
          // will only render geometry if the focused source has been
          // populated with features to focus.
          source: "__mapseed-focused-source__",
        })),
    );

  const layerGroupsById = mapStyleConfig.layerGroups.reduce(
    (memo, layerGroup) => ({
      ...memo,
      [layerGroup.id]: {
        id: layerGroup.id,
        popupContent: layerGroup.popupContent,
        filterSlider: layerGroup.filterSlider,
        isBasemap: !!layerGroup.basemap,
        isVisible: !!layerGroup.visibleDefault,
        isVisibleDefault: !!layerGroup.visibleDefault,
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
        layerGroupIds: mapStyleConfig.layerGroups
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

  const basemapLayerIds = mapStyleConfig.layerGroups
    .filter(lg => !!lg.basemap)
    .map(lg => lg.mapboxLayers.concat(lg.mapboxFocusedLayers || []))
    .reduce((flat, toFlatten) => flat.concat(toFlatten), [])
    .map(layer => layer.id);

  const interactiveLayerIds = mapStyleConfig.layerGroups
    .filter(lg => !!lg.interactive)
    .map(lg => lg.mapboxLayers.concat(lg.mapboxFocusedLayers || []))
    .reduce((flat, toFlatten) => flat.concat(toFlatten), [])
    .map(layer => layer.id);

  return {
    type: LOAD_STYLE_AND_METADATA,
    payload: {
      style,
      layers,
      sourcesMetadata,
      layerGroups: {
        byId: layerGroupsById,
        allIds: Object.keys(layerGroupsById),
      },
      basemapLayerIds,
      interactiveLayerIds,
    },
  };
}

////////////////////////////////////////////////////////////////////////////////
// REDUCER
////////////////////////////////////////////////////////////////////////////////
const INITIAL_STATE = {
  mapContainerDimensions: {
    width: 0,
    height: 0,
  },
  style: {
    version: 8,
    name: "Mapseed",
    glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    sprite: `${window.location.protocol}//${
      window.location.host
    }/static/css/images/markers/spritesheet`,
    sources: {},
  },
  layers: [],
  layerGroups: {
    byId: {},
    allIds: [],
  },
  sourcesMetadata: {},
  basemapLayerIds: [],
  interactiveLayerIds: [],
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_FEATURE_IN_GEOJSON_SOURCE:
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
                ].data.features.map(feature => {
                  return action.payload.featureId === feature.properties.id
                    ? action.payload.feature
                    : feature;
                }),
              },
            },
          },
        },
      };
    case UPDATE_FEATURES_IN_GEOJSON_SOURCE:
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
                features: action.payload.newFeatures,
              },
            },
          },
        },
      };
    case CREATE_FEATURES_IN_GEOJSON_SOURCE:
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
                ].data.features.concat(action.payload.newFeatures),
              },
            },
          },
        },
      };
    case REMOVE_FEATURE_IN_GEOJSON_SOURCE:
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
                  feature => feature.properties.id !== action.payload.featureId,
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
    case UPDATE_LAYER_FILTERS:
      return {
        ...state,
        style: {
          ...state.style,
        },
        layers: state.layers.map(layer => {
          if (action.payload.layerIds.includes(layer.id)) {
            return {
              ...layer,
              filter: action.payload.filter,
            };
          }

          return layer;
        }),
      };
    case LOAD_STYLE_AND_METADATA:
      return {
        ...state,
        ...action.payload,
        style: {
          ...state.style,
          ...action.payload.style,
        },
        mapContainerDimensions: {
          ...state.mapContainerDimensions,
          ...action.payload.mapContainerDimensions,
        },
      };
    case RESET_UI:
      return {
        ...state,
        layerGroups: {
          ...state.layerGroups,
          byId: Object.values(state.layerGroups.byId).reduce(
            (memo, layer) => ({
              ...memo,
              [layer.id]: {
                ...layer,
                isVisible: layer.isVisibleDefault,
              },
            }),
            {},
          ),
        },
      };
    case UPDATE_LAYER_GROUP_VISIBILITY:
      // eslint-disable-next-line no-case-declarations
      const layerGroupsById = Object.values(state.layerGroups.byId).reduce(
        (memo, layerGroup) => {
          let newVisibilityStatus;
          if (
            action.payload.isVisible &&
            state.layerGroups.byId[action.payload.layerGroupId].isBasemap &&
            layerGroup.isBasemap &&
            layerGroup.id !== action.payload.layerGroupId
          ) {
            // If the layer group in the payload is a basemap, switch off
            // other basemap layer groups.
            newVisibilityStatus = false;
          } else if (layerGroup.id === action.payload.layerGroupId) {
            newVisibilityStatus = action.payload.isVisible;
          }

          return {
            ...memo,
            [layerGroup.id]: {
              ...layerGroup,
              isVisible:
                typeof newVisibilityStatus === "undefined"
                  ? layerGroup.isVisible
                  : newVisibilityStatus,
            },
          };
        },
        {},
      );
      return {
        ...state,
        layerGroups: {
          byId: layerGroupsById,
          allIds: Object.keys(layerGroupsById),
        },
        style: {
          ...state.style,
        },
      };
    case UPDATE_LAYERS:
      return {
        ...state,
        layers: state.layers.concat(action.payload),
      };
    case UPDATE_MAP_CONTAINER_DIMENSIONS:
      return {
        ...state,
        mapContainerDimensions: {
          ...state.mapContainerDimensions,
          ...action.payload,
        },
      };
    default:
      return state;
  }
}
