import PropTypes from "prop-types";

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

// Selectors:
export const leftSidebarPanelPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  component: PropTypes.string.isRequired,
  title: PropTypes.string,
  icon: PropTypes.string.isRequired,
  content: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      layerGroups: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          title: PropTypes.string.isRequired,
        }),
      ),
    }),
  ),
});

export const leftSidebarConfigPropType = PropTypes.shape({
  is_enabled: PropTypes.bool,
  is_visible_default: PropTypes.bool,
  panels: PropTypes.arrayOf(leftSidebarPanelPropType).isRequired,
  isExpanded: PropTypes.bool,
});

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
export function setLeftSidebarComponent(componentName) {
  return { type: SET_COMPONENT, payload: componentName };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = {
  activeComponentName: undefined,
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
    case SET_COMPONENT:
      return {
        ...state,
        activeComponentName: action.payload,
      };
    default:
      return state;
  }
}
