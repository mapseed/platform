// Selectors
export const mapBasemapSelector = state => {
  return state.map.visibleBasemapId;
};
export const mapLayerStatusesSelector = state => {
  return state.map.layerStatuses;
};
export const mapSizeValiditySelector = state => {
  return state.map.isMapSizeValid;
};
export const mapPositionSelector = state => {
  return state.map.mapPosition;
};
export const mapboxStyleIdSelector = state => {
  return (
    Object.values(state.map.layerStatuses).find(layerStatus => {
      return layerStatus.type === "mapbox-style" && layerStatus.isVisible;
    }) || {}
  ).id;
};
export const mapFeatureFiltersSelector = state => {
  return state.map.featureFilters;
};
export const mapUpdatingFilterGroupIdSelector = state => {
  return state.map.updatingFilterGroupId;
};
export const mapUpdatingFilterTargetLayerSelector = state => {
  return state.map.updatingFilterTargetLayer;
};
export const mapDraggingSelector = state => {
  return state.map.isMapDragging;
}

// Actions
const SET_LAYER_LOAD_STATUS = "map/SET_LAYER_LOAD_STATUS";
const SET_MAP_POSITION = "map/SET_MAP_POSITION";
const SET_MAP_SIZE_VALIDITY = "map/SET_MAP_SIZE_VALIDITY";
const ACTIVATE_FEATURE_FILTER = "map/ACTIVATE_FEATURE_FILTER";
const DEACTIVATE_FEATURE_FILTER = "map/DEACTIVATE_FEATURE_FILTER";
const RESET_FEATURE_FILTER_GROUP = "map/RESET_FEATURE_FILTER_GROUP";
const SET_BASEMAP = "map/SET_BASEMAP";
const INIT_LAYER = "map/INIT_LAYER";
const UPDATE_LAYERS_VISIBLE = "map/UPDATE_LAYERS_VISIBLE";
const UPDATE_LAYERS_HIDDEN = "map/UPDATE_LAYERS_HIDDEN";
const SET_MAP_DRAGGING = "map/SET_MAP_DRAGGING";

// Action creators
export const setMapDragging = isDragging => ({
  type: SET_MAP_DRAGGING,
  payload: isDragging,
})
export const showLayers = (layerIds = []) => ({
  type: UPDATE_LAYERS_VISIBLE,
  payload: layerIds,
});

export const hideLayers = (layerIds = []) => ({
  type: UPDATE_LAYERS_HIDDEN,
  payload: layerIds,
});
// status definitions:
// unloaded: the layer is not going to be cached or loaded into Mapbox GL
// fetching: the layer will be loaded into Mapbox GL, but needs to fetch data first
// loading: the layer is ready to be loaded into Mapbox GL
// loaded: the layer is loaded and cached in Mapbox GL (even though it may not be visible)
export const initLayers = layers => {
  return {
    type: INIT_LAYER,
    payload: layers.map(layer => {
      let loadStatus = "unloaded";
      if (layer.is_visible_default) {
        loadStatus = layer.type === "place" ? "fetching" : "loading";
      }
      return {
        id: layer.id,
        isVisible: !!layer.is_visible_default,
        isBasemap: !!layer.is_basemap,
        type: layer.type,
        loadStatus: loadStatus,
      };
    }),
  };
};
export const setLayerLoaded = layerId => ({
  type: SET_LAYER_LOAD_STATUS,
  payload: {
    id: layerId,
    loadStatus: "loaded",
  },
});
export const setLayerLoading = layerId => ({
  type: SET_LAYER_LOAD_STATUS,
  payload: {
    id: layerId,
    loadStatus: "loading",
  },
});
export const setLayerError = layerId => ({
  type: SET_LAYER_LOAD_STATUS,
  payload: {
    id: layerId,
    loadStatus: "error",
  },
});
export const setBasemap = basemapId => ({
  type: SET_BASEMAP,
  payload: basemapId,
});
export const setMapPosition = mapPosition => {
  return {
    type: SET_MAP_POSITION,
    payload: mapPosition,
  };
};
export const setMapSizeValidity = isValidSize => {
  return {
    type: SET_MAP_SIZE_VALIDITY,
    payload: isValidSize,
  };
};
export const activateFeatureFilter = filterInfo => {
  return {
    type: ACTIVATE_FEATURE_FILTER,
    payload: filterInfo,
  };
};
export const deactivateFeatureFilter = filterInfo => {
  return {
    type: DEACTIVATE_FEATURE_FILTER,
    payload: filterInfo,
  };
};
export const resetFeatureFilterGroup = filterInfo => {
  return {
    type: RESET_FEATURE_FILTER_GROUP,
    payload: filterInfo,
  };
};

// Reducers
const INITIAL_STATE = {
  visibleBasemapId: undefined,
  layerStatuses: {},
  featureFilters: [],
  updatingFilterGroupId: undefined,
  updatingFilterTargetLayer: undefined,
  mapPosition: undefined,
  isMapSizeValid: true,
  isMapDragging: false,
};

export default function reducer(state = INITIAL_STATE, action) {
  let newStatuses;

  switch (action.type) {
    case SET_MAP_DRAGGING:
      return {
        ...state,
        isMapDragging: action.payload,
      };
    case SET_MAP_SIZE_VALIDITY:
      return {
        ...state,
        isMapSizeValid: action.payload,
      };
    case SET_MAP_POSITION:
      return {
        ...state,
        mapPosition: {
          ...action.payload,
        },
      };
    case SET_BASEMAP:
      newStatuses = {
        [action.payload]: {
          ...state.layerStatuses[action.payload],
          isVisible: true,
          loadStatus: "loading",
        },
      };

      // If a previous basemap was already visible, switch it off.
      if (state.visibleBasemapId && state.visibleBasemapId !== action.payload) {
        newStatuses[state.visibleBasemapId] = {
          ...state.layerStatuses[state.visibleBasemapId],
          isVisible: false,
        };
      }

      return {
        ...state,
        visibleBasemapId: action.payload,
        layerStatuses: {
          ...state.layerStatuses,
          ...newStatuses,
        },
      };
    case INIT_LAYER:
      newStatuses = action.payload.reduce((memo, loadStatus) => {
        return {
          ...memo,
          [loadStatus.id]: {
            ...loadStatus,
          },
        };
      }, {});

      return {
        ...state,
        layerStatuses: {
          ...state.layerStatuses,
          ...newStatuses,
        },
      };
    case UPDATE_LAYERS_VISIBLE:
      newStatuses = action.payload.reduce((memo, layerId) => {
        return {
          ...memo,
          [layerId]: {
            ...state.layerStatuses[layerId],
            isVisible: true,
          },
        };
      }, {});

      return {
        ...state,
        layerStatuses: {
          ...state.layerStatuses,
          ...newStatuses,
        },
      };
    case UPDATE_LAYERS_HIDDEN:
      newStatuses = action.payload.reduce((memo, layerId) => {
        return {
          ...memo,
          [layerId]: {
            ...state.layerStatuses[layerId],
            isVisible: false,
          },
        };
      }, {});

      return {
        ...state,
        layerStatuses: {
          ...state.layerStatuses,
          ...newStatuses,
        },
      };
    case SET_LAYER_LOAD_STATUS:
      return {
        ...state,
        layerStatuses: {
          ...state.layerStatuses,
          [action.payload.id]: {
            ...state.layerStatuses[action.payload.id],
            ...action.payload,
          },
        },
      };
    case ACTIVATE_FEATURE_FILTER:
      return {
        ...state,
        updatingFilterGroupId: action.payload.groupId,
        updatingFilterTargetLayer: action.payload.targetLayer,
        featureFilters: state.featureFilters.concat(action.payload),
      };
    case DEACTIVATE_FEATURE_FILTER:
      return {
        ...state,
        updatingFilterGroupId: action.payload.groupId,
        updatingFilterTargetLayer: action.payload.targetLayer,
        featureFilters: state.featureFilters.filter(
          featureFilter => featureFilter.id !== action.payload.id,
        ),
      };
    case RESET_FEATURE_FILTER_GROUP:
      return {
        ...state,
        updatingFilterGroupId: action.payload.groupId,
        updatingFilterTargetLayer: action.payload.targetLayer,
        featureFilters: state.featureFilters.filter(
          featureFilter => featureFilter.groupId !== action.payload.groupId,
        ),
      };
    default:
      return state;
  }
}
