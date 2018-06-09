// Selectors:
export const storyConfigSelector = state => {
  return state.config.story;
};
export const placeConfigSelector = state => {
  return state.config.place;
};
export const mapConfigSelector = state => {
  return state.config.map;
};
export const rightSidebarConfigSelector = state => {
  return state.config.right_sidebar;
};

// Actions:
const SET_CONFIG = "SET_CONFIG";

// Action creators:
export function setConfig(config) {
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
