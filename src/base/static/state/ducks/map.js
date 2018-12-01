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

// Actions
const SET_LAYER_STATUS = "map/SET_LAYER_STATUS";
const SET_MAP_POSITION = "map/SET_MAP_POSITION";
const SET_MAP_SIZE_VALIDITY = "map/SET_MAP_SIZE_VALIDITY";
const ACTIVATE_FEATURE_FILTER = "map/ACTIVATE_FEATURE_FILTER";
const DEACTIVATE_FEATURE_FILTER = "map/DEACTIVATE_FEATURE_FILTER";
const RESET_FEATURE_FILTER_GROUP = "map/RESET_FEATURE_FILTER_GROUP";
const HIDE_OLD_BASEMAP = "map/HIDE_OLD_BASEMAP";
const SHOW_BASEMAP = "map/SHOW_BASEMAP";

// Action creators
export const showLayers = (layerIds = []) =>
  layerIds.map(layerId => ({
    type: SET_LAYER_STATUS,
    payload: {
      id: layerId,
      status: "loading",
      isVisible: true,
    },
  }));
export const hideLayers = (layerIds = []) =>
  layerIds.map(layerId => ({
    type: SET_LAYER_STATUS,
    payload: {
      id: layerId,
      isVisible: false,
    },
  }));
export const initLayers = layers => {
  return layers.map(layer => {
    let status = "hidden";
    if (layer.is_visible_default) {
      status = layer.type === "place" ? "fetching" : "loading";
    }
    return {
      type: SET_LAYER_STATUS,
      payload: {
        id: layer.id,
        isVisible: !!layer.is_visible_default,
        isBasemap: !!layer.is_basemap,
        type: layer.type,
        status: status,
      },
    };
  });
};
export const setLayerLoaded = layerId => ({
  type: SET_LAYER_STATUS,
  payload: {
    id: layerId,
    status: "loaded",
  },
});
export const setLayerFetched = layerId => ({
  type: SET_LAYER_STATUS,
  payload: {
    id: layerId,
    status: "loading",
  },
});
export const setLayerError = layerId => ({
  type: SET_LAYER_STATUS,
  payload: {
    id: layerId,
    status: "error",
  },
});
export const setBasemap = basemapId => [
  {
    type: HIDE_OLD_BASEMAP,
  },
  {
    type: SHOW_BASEMAP,
    payload: basemapId,
  },
];
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
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
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
    case HIDE_OLD_BASEMAP:
      if (state.visibleBasemapId) {
        return {
          ...state,
          visibleBasemapId: null,
          layerStatuses: {
            ...state.layerStatuses,
            [state.visibleBasemapId]: {
              ...state.layerStatuses[state.visibleBasemapId],
              isVisible: false,
            },
          },
        };
      }
      return state;
    case SHOW_BASEMAP:
      return {
        ...state,
        visibleBasemapId: action.payload,
        layerStatuses: {
          ...state.layerStatuses,
          [action.payload]: {
            ...state.layerStatuses[action.payload],
            isVisible: true,
            status: "loading",
          },
        },
      };
    case SET_LAYER_STATUS:
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
