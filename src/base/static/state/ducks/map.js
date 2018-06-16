// Selectors
export const mapBasemapSelector = state => {
  return state.map.visibleBasemapId;
};
export const mapLayersSelector = state => {
  return state.map.visibleLayerIds;
};
export const mapSizeValiditySelector = state => {
  return state.map.isMapSizeValid;
};
export const mapPositionSelector = state => {
  return state.map.mapPosition;
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
export const setBasemap = basemapId => {
  return {
    type: SET_BASEMAP,
    payload: {
      basemapId: basemapId,
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
  visibleBasemapId: undefined,
  visibleLayerIds: [],
  mapPosition: undefined,
  isMapSizeValid: true,
};

export default function reducer(state = INITIAL_STATE, action) {
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
      return {
        ...state,
        visibleLayerIds: state.visibleLayerIds.includes(action.payload.layerId)
          ? // Toggle a layer off
            state.visibleLayerIds.filter(
              layerId => layerId !== action.payload.layerId,
            )
          : // Toggle a layer on
            state.visibleLayerIds.concat(action.payload.layerId),
      };
    case SET_BASEMAP:
      return {
        ...state,
        visibleBasemapId:
          state.visibleBasemapId !== action.payload.basemapId
            ? action.payload.basemapId
            : state.visibleBasemapId,
      };
    default:
      return state;
  }
}
