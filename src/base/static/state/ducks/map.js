// Selectors
export const mapLayersBasemapSelector = state => {
  return {
    visibleBasemapId: state.mapLayers.visibleBasemapId,
    priorVisibleBasemapId: state.mapLayers.priorVisibleBasemapId,
  };
};
export const mapSizeValiditySelector = state => {
  return state.mapLayers.isValidSize;
};
export const mapPositionSelector = state => {
  return state.mapLayers.mapPosition;
};

// Actions
const TOGGLE_LAYER_VISIBILITY = "map/TOGGLE_LAYER_VISIBILITY";
const SET_BASEMAP = "map/SET_BASEMAP";
const SET_MAP_POSITION = "map/SET_MAP_POSITION";
const SET_MAP_SIZE_VALIDITY = "map/SET_MAP_SIZE_VALIDITY";

// Action creators
export const toggleLayerVisibility = layerId => {
  return {
    type: TOGGLE_LAYER_VISIBILITY,
    payload: {
      layerId: layerId,
    },
  };
};
export const setBasemap = layerId => {
  return {
    type: SET_BASEMAP,
    payload: {
      basemapId: layerId,
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

// Reducers
const INITIAL_STATE = {
  priorVisibleBasemapId: undefined,
  visibleBasemapId: undefined,
  visibleLayersIds: [],
  mapPosition: undefined,
  isMapSizeValid: true,
};

export default function reducer(state = INITIAL_STATE, action) {
  let visibleLayerIds = [];
  let layerIdToAdd;
  let layerIdToRemove;
  switch (action.type) {
    case SET_MAP_SIZE_VALIDITY:
      return {
        ...state,
        isValidSize: action.payload,
      };
    case SET_MAP_POSITION:
      return {
        ...state,
        mapPosition: {
          ...action.payload,
        },
      };
    case TOGGLE_LAYER_VISIBILITY:
      if (state.visibleLayerIds.includes(action.payload.layerId)) {
        // Toggle a layer off
        visibleLayerIds.filter(layerId => layerId !== action.payload.layerId);
      } else {
        // Toggle a layer on
        visibleLayers;
      }

      return {
        ...state,
        visibleLayerIds: visibleLayerIds,
        layerIdToAdd: null,
        layerIdToRemove: null,
      };
    case SET_BASEMAP:
      if (state.visibleBasemapId !== action.payload.basemapId) {
        return {
          ...state,
          priorVisibleBasemapId: state.visibleBasemapId,
          visibleBasemapId: action.payload.basemapId,
        };
        return {
          ...state,
          priorVisibleBasemapId: state.visibleBasemapId,
          visibleBasemapId: action.payload.basemapId,
        };
      } else {
        return state;
      }
    default:
      return state;
  }
}
