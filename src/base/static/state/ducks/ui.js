// This is skeleton code only!
// TODO(luke): refactor our current implementation in AppView to use
// this reducer

// Selectors:
export const sidebarExpandedSelector = state => {
  return state.ui.isSidebarExpanded;
};
export const contentPanelOpenSelector = state => {
  return state.ui.isConentPanelOpen;
};

// Actions:
const SET_UI_SIDEBAR = "ui/SET_UI_SIDEBAR";
const SET_UI_CONTENT_PANEL = "ui/SET_UI_CONTENT_PANEL";

// Action creators:
export function setContentPanel(isOpen) {
  return { type: SET_UI_CONTENT_PANEL, payload: isOpen };
}

export function setSidebar(isExpanded) {
  return { type: SET_UI_SIDEBAR, payload: isExpanded };
}

// Reducers:
const INITIAL_STATE = {
  isContentPanelOpen: undefined,
  isSidebarExpanded: undefined,
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_UI_CONTENT_PANEL:
      return {
        ...state,
        isContentPanelOpen: action.payload,
      };
    case SET_UI_SIDEBAR:
      return {
        ...state,
        isSidebarExpanded: action.payload,
      };
    default:
      return state;
  }
}
