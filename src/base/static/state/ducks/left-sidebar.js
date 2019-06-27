// Selectors:
export const leftSidebarConfigSelector = state => {
  return state.leftSidebar.config;
};
export const isLeftSidebarExpandedSelector = state => {
  return state.leftSidebar.isExpanded;
};

// Actions:
const LOAD = "left-sidebar/LOAD";
const SET_EXPANDED = "left-sidebar/SET_EXPANDED";
const SET_COMPONENT = "left-sidebar/SET_COMPONENT";

// Action creators:
export function loadLeftSidebarConfig(config) {
  return { type: LOAD, payload: config };
}
export function setLeftSidebarExpanded(isExpanded) {
  return { type: SET_EXPANDED, payload: isExpanded };
}

// Reducers:
const INITIAL_STATE = {
  config: {
    panels: [],
  },
  isExpanded: false,
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        config: action.payload,
      };
    case SET_EXPANDED:
      return {
        ...state,
        isExpanded: action.payload,
      };
    default:
      return state;
  }
}
