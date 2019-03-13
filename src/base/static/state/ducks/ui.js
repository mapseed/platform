// This is skeleton code only!
// TODO(luke): refactor our current implementation in AppView to use
// this reducer

// Selectors:
export const currentTemplateSelector = state => state.ui.currentTemplate;
export const addPlaceButtonVisibilitySelector = state =>
  state.ui.isAddPlaceButtonVisible;
export const geocodeAddressBarVisibilitySelector = state =>
  state.ui.isGeocodeAddressBarVisible;
export const isEditModeToggled = state => state.ui.isEditModeToggled;
export const uiVisibilitySelector = (uiComponentName, state) =>
  state.ui.uiVisibility[uiComponentName];
export const contentPanelComponentSelector = state =>
  state.ui.contentPanelComponent;
export const pageSlugSelector = state => state.ui.activePageSlug;

// Actions:
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
    rightSidebar: false,
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
