// This is skeleton code only!
// TODO(luke): refactor our current implementation in AppView to use
// this reducer

// Selectors:
export const rightSidebarExpandedSelector = state => {
  return state.ui.isRightSidebarExpanded;
};
export const leftSidebarExpandedSelector = state => {
  return state.ui.isLeftSidebarExpanded;
};
export const leftSidebarComponentSelector = state => {
  return state.ui.leftSidebarComponent;
};
export const contentPanelOpenSelector = state => {
  return state.ui.isConentPanelOpen;
};

// Actions:
const SET_UI_RIGHT_SIDEBAR = "ui/SET_UI_RIGHT_SIDEBAR";
const SET_UI_LEFT_SIDEBAR = "ui/SET_UI_LEFT_SIDEBAR";
const SET_UI_CONTENT_PANEL = "ui/SET_UI_CONTENT_PANEL";

// Action creators:
export function setContentPanel(isOpen) {
  return { type: SET_UI_CONTENT_PANEL, payload: isOpen };
}
export function setRightSidebar(isExpanded) {
  return { type: SET_UI_RIGHT_SIDEBAR, payload: isExpanded };
}
export function setLeftSidebar(isExpanded) {
  return { type: SET_UI_LEFT_SIDEBAR, payload: isExpanded };
}

// Reducers:
const INITIAL_STATE = {
  isContentPanelOpen: undefined,
  isSidebarExpanded: undefined,
  isLeftSidebarExpanded: false,
  leftSidebarComponent: "MapLayerPanel", // TODO-- make this configurable
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_UI_CONTENT_PANEL:
      return {
        ...state,
        isContentPanelOpen: action.payload,
      };
    case SET_UI_RIGHT_SIDEBAR:
      return {
        ...state,
        isRightSidebarExpanded: action.payload,
      };
    case SET_UI_LEFT_SIDEBAR:
      return {
        ...state,
        isLeftSidebarExpanded: action.payload,
      };
    default:
      return state;
  }
}
