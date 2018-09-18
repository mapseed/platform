// Selectors:
export const leftSidebarConfigSelector = state => {
  return state.leftSidebar.config;
};
export const leftSidebarPanelConfigSelector = (state, panelComponentName) => {
  return state.leftSidebar.config.panels.find(
    panel => panel.component === panelComponentName,
  );
};
export const isLeftSidebarExpandedSelector = state => {
  return state.leftSidebar.isExpanded;
};
export const leftSidebarComponentSelector = state => {
  return state.leftSidebar.activeComponentName;
};

// Actions:
const SET_CONFIG = "left-sidebar/SET_CONFIG";
const SET_EXPANDED = "left-sidebar/SET_EXPANDED";
const SET_COMPONENT = "left-sidebar/SET_COMPONENT";

// Action creators:
export function setLeftSidebarConfig(config) {
  return { type: SET_CONFIG, payload: config };
}
export function setLeftSidebarExpanded(isExpanded) {
  return { type: SET_EXPANDED, payload: isExpanded };
}
export function setLeftSidebarComponent(componentName) {
  return { type: SET_COMPONENT, payload: componentName };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = {
  activeComponentName: undefined,
  config: undefined,
  isExpanded: false,
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_CONFIG:
      return {
        ...state,
        config: action.payload,
      };
    case SET_EXPANDED:
      return {
        ...state,
        isExpanded: action.payload,
      };
    case SET_COMPONENT:
      return {
        ...state,
        activeComponentName: action.payload,
      };
    default:
      return state;
  }
}
