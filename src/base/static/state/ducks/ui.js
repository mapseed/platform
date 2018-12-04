// This is skeleton code only!
// TODO(luke): refactor our current implementation in AppView to use
// this reducer

// Selectors:
export const rightSidebarExpandedSelector = state => {
  return state.ui.isRightSidebarExpanded;
};
export const isLeftSidebarExpandedSelector = state => {
  return state.ui.isLeftSidebarExpanded;
};
export const leftSidebarComponentSelector = state => {
  return state.ui.leftSidebarComponent;
};
export const contentPanelOpenSelector = state => {
  return state.ui.isConentPanelOpen;
};
export const currentTemplateSelector = state => {
  return state.ui.currentTemplate;
};
export const addPlaceButtonVisibilitySelector = state => {
  return state.ui.isAddPlaceButtonVisible;
};

// Actions:
const SET_UI_RIGHT_SIDEBAR = "ui/SET_UI_RIGHT_SIDEBAR";
const SET_UI_LEFT_SIDEBAR = "ui/SET_UI_LEFT_SIDEBAR";
const SET_UI_CONTENT_PANEL = "ui/SET_UI_CONTENT_PANEL";
const SET_CURRENT_TEMPLATE = "ui/SET_CURRENT_TEMPLATE";
const SET_ADD_PLACE_BUTTON_VISIBILITY = "ui/SET_ADD_PLACE_BUTTON_VISIBILITY";

// Action creators:
export function setContentPanel(isOpen) {
  return { type: SET_UI_CONTENT_PANEL, payload: isOpen };
}
export function setRightSidebar(isExpanded) {
  return { type: SET_UI_RIGHT_SIDEBAR, payload: isExpanded };
}
export function setLeftSidebar(status) {
  return { type: SET_UI_LEFT_SIDEBAR, payload: status };
}
export function setCurrentTemplate(templateName) {
  return { type: SET_CURRENT_TEMPLATE, payload: templateName };
}
export function setAddPlaceButtonVisibility(isVisible) {
  return { type: SET_ADD_PLACE_BUTTON_VISIBILITY, payload: isVisible };
}

// Reducers:
const INITIAL_STATE = {
  isContentPanelOpen: undefined,
  isSidebarExpanded: undefined,
  isLeftSidebarExpanded: false,
  leftSidebarComponent: undefined,
  currentTemplate: "map",
  isAddPlaceButtonVisible: false,
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
        isLeftSidebarExpanded: action.payload.isExpanded,
        leftSidebarComponent: action.payload.component,
      };
    case SET_CURRENT_TEMPLATE:
      return {
        ...state,
        currentTemplate: action.payload,
      };
    case SET_ADD_PLACE_BUTTON_VISIBILITY:
      return {
        ...state,
        isAddPlaceButtonVisible: action.payload,
      };
    default:
      return state;
  }
}
