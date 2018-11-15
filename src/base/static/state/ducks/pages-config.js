// Selectors:
export const pagesConfigSelector = state => {
  return state.pagesConfig;
};

// Actions:
const SET_CONFIG = "pages/SET_CONFIG";

// Action creators:
export function setPagesConfig(config) {
  return { type: SET_CONFIG, payload: config };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = null;

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_CONFIG:
      return action.payload;
    default:
      return state;
  }
}
