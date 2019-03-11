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
  return state.ui.isContentPanelOpen;
};
export const currentTemplateSelector = state => {
  return state.ui.currentTemplate;
};
export const addPlaceButtonVisibilitySelector = state => {
  return state.ui.isAddPlaceButtonVisible;
};
export const geocodeAddressBarVisibilitySelector = state => {
  return state.ui.isGeocodeAddressBarVisible;
};
export const isEditModeToggled = state => {
  return state.ui.isEditModeToggled;
};
export const uiVisibilitySelector = (uiComponentName, state) => {
  return state.ui.uiVisibility[uiComponentName];
};
export const contentPanelComponentSelector = state =>
  state.ui.contentPanelComponent;
export const pageSlugSelector = state => state.ui.activePageSlug;

// Actions:
const SET_UI_RIGHT_SIDEBAR = "ui/SET_UI_RIGHT_SIDEBAR";
const SET_UI_LEFT_SIDEBAR = "ui/SET_UI_LEFT_SIDEBAR";
const SET_UI_CONTENT_PANEL = "ui/SET_UI_CONTENT_PANEL";
const UPDATE_CURRENT_TEMPLATE = "ui/UPDATE_CURRENT_TEMPLATE";
const UPDATE_ADD_PLACE_BUTTON_VISIBILITY =
  "ui/UPDATE_ADD_PLACE_BUTTON_VISIBILITY";
const UPDATE_GEOCODE_ADDRESS_BAR_VISIBILITY =
  "ui/UPDATE_GEOCODE_ADDRESS_BAR_VISIBILITY";
const UPDATE_EDIT_MODE_TOGGLED = "ui/UPDATE_EDIT_MODE_TOGGLED";
const UPDATE_UI_VISIBILITY = "ui/UPDATE_UI_VISIBILITY";
const UPDATE_ACTIVE_PAGE = "ui/UPDATE_ACTIVE_PAGE";
const UPDATE_CONTENT_PANEL_COMPONENT = "ui/UPDATE_CONTENT_PANEL_COMPONENT";

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
export function updateCurrentTemplate(templateName) {
  return { type: UPDATE_CURRENT_TEMPLATE, payload: templateName };
}
export function updateAddPlaceButtonVisibility(isVisible) {
  return { type: UPDATE_ADD_PLACE_BUTTON_VISIBILITY, payload: isVisible };
}
export function setGeocodeAddressBarVisibility(isVisible) {
  return { type: UPDATE_GEOCODE_ADDRESS_BAR_VISIBILITY, payload: isVisible };
}
export function updateEditModeToggled(isToggled) {
  return { type: UPDATE_EDIT_MODE_TOGGLED, payload: isToggled };
}
export function updateUIVisibility(uiComponentName, isVisible) {
  return {
    type: UPDATE_UI_VISIBILITY,
    payload: { uiComponentName, isVisible },
  };
}
export function updateActivePage(pageSlug) {
  return {
    type: UPDATE_ACTIVE_PAGE,
    payload: pageSlug,
  };
}
export function updateContentPanelComponent(componentName) {
  return {
    type: UPDATE_CONTENT_PANEL_COMPONENT,
    payload: componentName,
  };
}

// Reducers:
const INITIAL_STATE = {
  activePageSlug: null,
  uiVisibility: {
    contentPanel: false,
    mapCenterpoint: false,
    spotlightMask: false,
  },
  contentPanelComponent: null,
  isContentPanelVisible: false,
  isRightSidebarExpanded: false,
  isLeftSidebarExpanded: false,
  leftSidebarComponent: undefined,
  currentTemplate: "map",
  isAddPlaceButtonVisible: false,
  isGeocodeAddressBarVisible: false,
  isEditModeToggled: false,
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_UI_VISIBILITY:
      return {
        ...state,
        uiVisibility: {
          ...state.uiVisibility,
          [action.payload.uiComponentName]: action.payload.isVisible,
        },
      };
    case UPDATE_ACTIVE_PAGE:
      return {
        ...state,
        activePageSlug: action.payload,
      };
    case UPDATE_CONTENT_PANEL_COMPONENT:
      return {
        ...state,
        contentPanelComponent: action.payload,
      };
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
    case UPDATE_CURRENT_TEMPLATE:
      return {
        ...state,
        currentTemplate: action.payload,
      };
    case UPDATE_ADD_PLACE_BUTTON_VISIBILITY:
      return {
        ...state,
        isAddPlaceButtonVisible: action.payload,
      };
    case UPDATE_GEOCODE_ADDRESS_BAR_VISIBILITY:
      return {
        ...state,
        isGeocodeAddressBarVisible: action.payload,
      };
    case UPDATE_EDIT_MODE_TOGGLED:
      return {
        ...state,
        isEditModeToggled: action.payload,
      };
    default:
      return state;
  }
}
