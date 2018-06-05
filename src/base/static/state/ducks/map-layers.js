// Selectors
export const mapLayersBasemapSelector = state => {
  return {
    visibleBasemapId: state.mapLayers.visibleBasemapId,
    priorVisibleBasemapId: state.mapLayers.priorVisibleBasemapId,
  };
};
// Actions
const TOGGLE_LAYER_VISIBILITY = "map-layers/TOGGLE_LAYER_VISIBILITY";
const SET_BASEMAP = "map-layers/SET_BASEMAP";

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

// Reducers
const INITIAL_STATE = {
  priorVisibleBasemapId: undefined,
  visibleBasemapId: undefined,
  visibleLayersIds: [],
};

export default function reducer(state = INITIAL_STATE, action) {
  let visibleLayerIds = [];
  let layerIdToAdd;
  let layerIdToRemove;
  switch (action.type) {
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
