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
const HIDE_VISIBLE_BASEMAP = "map/HIDE_VISIBLE_BASEMAP";
const SET_VISIBLE_BASEMAP = "map/SET_VISIBLE_BASEMAP";

// Action creators
export const setLayerStatus = (layerId, layerStatus) => {
  return [
    layerStatus.isBasemap && {
      type: HIDE_VISIBLE_BASEMAP,
    },
    layerStatus.isBasemap && {
      type: SET_VISIBLE_BASEMAP,
      payload: layerId,
    },
    {
      type: SET_LAYER_STATUS,
      payload: {
        layerId: layerId,
        layerStatus: layerStatus,
      },
    },
  ];
};

export const showLayers = ({
  layerIds = [],
  layerStatuses,
  hideOthers = false,
}) => {
  return Object.values(layerStatuses).reduce(
    (actions, layerStatus) => {
      if (layerIds.includes(layerStatus.id)) {
        return actions.concat([
          setLayerStatus(layerStatus.id, {
            ...layerStatus,
            status: "loading",
            isVisible: true,
          }),
        ]);
      } else if (hideOthers && !layerStatus.isBasemap) {
        return actions.concat([
          setLayerStatus(layerStatus.id, {
            ...layerStatus,
            isVisible: false,
          }),
        ]);
      } else {
        return actions;
      }
    },
    [],
  );
};

export const hideLayers = ({ layerIds }) => {
  return layerIds.map(layerId => {
    return setLayerStatus(layerId, {
      isVisible: false,
    });
  });
};

export const initMapLayers = layers => {
  return layers.map(layer => {
    return setLayerStatus(layer.id, {
      id: layer.id,
      isVisible: !!layer.is_visible_default,
      isBasemap: layer.is_basemap,
      type: layer.type,
      status: !!layer.is_visible_default ? "loading" : "",
    });
  });
};

export const setLayerLoaded = layerId => {
  return setLayerStatus(layerId, {
    status: "loaded",
  });
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
    case SET_VISIBLE_BASEMAP:
      return {
        ...state,
        visibleBasemapId: action.payload,
      };
    case HIDE_VISIBLE_BASEMAP:
      if (state.visibleBasemapId) {
        return {
          ...state,
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
    default:
      return state;
  }
}
