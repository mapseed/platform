// Selectors:
export const leftSidebarConfigSelector = state => {
  return state.leftSidebarConfig;
};
export const leftSidebarPanelConfigSelector = (state, panelComponentName) => {
  return state.leftSidebarConfig.panels.find(
    panel => panel.component === panelComponentName,
  );
};

// Actions:
const SET_CONFIG = "left-sidebar/SET_CONFIG";

// Action creators:
export function setLeftSidebarConfig(config) {
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
