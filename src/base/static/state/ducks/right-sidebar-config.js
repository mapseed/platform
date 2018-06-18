// Selectors:
export const rightSidebarConfigSelector = state => {
  return state.rightSidebarConfig;
};

// Actions:
const SET_CONFIG = "right-sidebar/SET_CONFIG";

// Action creators:
export function setRightSidebarConfig(config) {
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
