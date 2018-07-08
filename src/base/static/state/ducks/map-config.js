// Selectors:
export const mapConfigSelector = state => {
  return state.mapConfig;
};

export const mapLayersSelector = state => {
  return state.mapConfig.layers;
};

// Actions:
const SET_CONFIG = "map/SET_CONFIG";

// Action creators:
export function setMapConfig(config) {
  return { type: SET_CONFIG, payload: config };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = null;

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_CONFIG:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
