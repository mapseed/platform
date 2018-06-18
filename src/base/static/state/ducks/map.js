// Selectors
export const mapBasemapSelector = state => {
  return state.map.visibleBasemapId;
};
export const mapLayersStatusSelector = state => {
  return state.map.layersStatus;
};
export const mapSizeValiditySelector = state => {
  return state.map.isMapSizeValid;
};
export const mapPositionSelector = state => {
  return state.map.mapPosition;
};

// Actions
const SET_LAYER_STATUS = "map/SET_LAYER_STATUS";
const SET_BASEMAP = "map/SET_BASEMAP";
const SET_MAP_POSITION = "map/SET_MAP_POSITION";
const SET_MAP_SIZE_VALIDITY = "map/SET_MAP_SIZE_VALIDITY";

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
export const setBasemap = layerId => {
  return {
    type: SET_BASEMAP,
    payload: {
      layerId: layerId,
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
  visibleBasemapId: null,
  layersStatus: {},
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
        layersStatus: {
          ...state.layersStatus,
          [action.payload.layerId]: {
            ...action.payload.layerStatus,
          },
        },
      };
    case SET_BASEMAP:
      return {
        ...state,
        visibleBasemapId: action.payload.layerId,
      };
    default:
      return state;
  }
}
