// Selectors:
export const supportConfigSelector = state => {
  return state.supportConfig;
};

// Actions:
const LOAD = "support/LOAD";

// Action creators:
export function loadSupportConfig(config) {
  return { type: LOAD, payload: config };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = null;

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
