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
const SET_BASEMAP_STATUS = "map/SET_BASEMAP_STATUS";
const SET_MAP_POSITION = "map/SET_MAP_POSITION";
const SET_MAP_SIZE_VALIDITY = "map/SET_MAP_SIZE_VALIDITY";
const ACTIVATE_FEATURE_FILTER = "map/ACTIVATE_FEATURE_FILTER";
const DEACTIVATE_FEATURE_FILTER = "map/DEACTIVATE_FEATURE_FILTER";
const RESET_FEATURE_FILTER_GROUP = "map/RESET_FEATURE_FILTER_GROUP";

// Action creators
export const setLayerStatus = (layerId, layerStatus) => {
  return {
    type: SET_LAYER_STATUS,
    payload: {
      layerId: layerId,
      layerStatus: layerStatus,
    },
  };
};
export const setBasemap = (layerId, layerStatus) => {
  return {
    type: SET_BASEMAP_STATUS,
    payload: {
      layerId: layerId,
      layerStatus: layerStatus,
    },
  };
};
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
export const activateFeatureFilter = featureFilter => {
  return {
    type: ACTIVATE_FEATURE_FILTER,
    payload: featureFilter,
  };
};
export const deactivateFeatureFilter = filterId => {
  return {
    type: DEACTIVATE_FEATURE_FILTER,
    payload: filterId,
  };
};
export const resetFeatureFilterGroup = filterGroupId => {
  return {
    type: RESET_FEATURE_FILTER_GROUP,
    payload: filterGroupId,
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
    case SET_LAYER_STATUS:
      return {
        ...state,
        layerStatuses: {
          ...state.layerStatuses,
          [action.payload.layerId]: {
            ...state.layerStatuses[action.payload.layerId],
            ...action.payload.layerStatus,
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
        featureFilters: state.featureFilters.filter(
          featureFilter => featureFilter.id !== action.payload,
        ),
      };
    case RESET_FEATURE_FILTER_GROUP:
      return {
        ...state,
        featureFilters: state.featureFilters.filter(
          featureFilter => featureFilter.groupId !== action.payload,
        ),
      };
    case SET_BASEMAP_STATUS:
      return {
        ...state,
        layerStatuses: {
          ...state.layerStatuses,
          // Switch off the old basemap.
          [state.visibleBasemapId]: {
            ...state.layerStatuses[state.visibleBasemapId],
            isVisible: false,
          },
          // Switch on the new basemap.
          [action.payload.layerId]: {
            ...state.layerStatuses[action.payload.layerId],
            ...action.payload.layerStatus,
          },
        },
        visibleBasemapId: action.payload.layerId,
      };
    default:
      return state;
  }
}
