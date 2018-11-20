// Selectors:
export const navBarConfigSelector = state => {
  return state.navBarConfig;
};

// Actions:
const SET_CONFIG = "navBar/SET_CONFIG";

// Action creators:
export function setNavBarConfig(config) {
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
