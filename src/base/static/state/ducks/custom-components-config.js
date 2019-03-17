// Selectors:
export const customComponentsConfigSelector = state => {
  return state.customComponentsConfig;
};

// Actions:
const LOAD = "custom-components-config/LOAD";

// Action creators:
export function loadCustomComponentsConfig(config = {}) {
  return { type: LOAD, payload: config };
}

// Reducers:
const INITIAL_STATE = null;

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return action.payload;
    default:
      return state;
  }
}
