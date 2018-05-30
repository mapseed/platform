// Selectors
export const mapLayersBasemapSelector = state => state.mapLayers.visibleBasemap;

// Actions
const SET_LAYER_VISIBILITY = "map-layers/SET_LAYER_VISIBILITY";
const SET_BASEMAP = "map-layers/SET_BASEMAP";

// Action creators
export const setLayerVisibility = layerId => ({
  type: SET_LAYER_VISIBILITY,
  payload: layerId,
});
export const setBasemap = basemapId => ({
  type: SET_BASEMAP,
  payload: basemapId,
});

// Reducers
const INITIAL_STATE = {
  visibleBasemap: undefined,
  visibleLayers: [],
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_LAYER_VISIBILITY:
      console.log("SET_LAYER_VISIBILITY");
      return {
        ...state,
        targetLayer: action.payload,
      };
    case SET_BASEMAP:
      console.log("SET_BASEMAP", action.payload);
      return {
        ...state,
        visibleBasemap: action.payload,
      };
    default:
      return state;
  }
}
