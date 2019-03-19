import { getLayout } from "../../utils/layout-utils";

// Selectors:
export const currentTemplateSelector = state => state.ui.currentTemplate;
export const isEditModeToggled = state => state.ui.isEditModeToggled;
export const uiVisibilitySelector = (uiComponentName, state) =>
  state.ui.uiVisibility[uiComponentName];
export const contentPanelComponentSelector = state =>
  state.ui.contentPanelComponent;
export const pageSlugSelector = state => state.ui.activePageSlug;
export const layoutSelector = state => state.ui.layout;
export const infoModalContentSelector = state => state.ui.infoModalContent;

// Actions:
const UPDATE_CURRENT_TEMPLATE = "ui/UPDATE_CURRENT_TEMPLATE";
const UPDATE_EDIT_MODE_TOGGLED = "ui/UPDATE_EDIT_MODE_TOGGLED";
const UPDATE_UI_VISIBILITY = "ui/UPDATE_UI_VISIBILITY";
const UPDATE_ACTIVE_PAGE = "ui/UPDATE_ACTIVE_PAGE";
const UPDATE_CONTENT_PANEL_COMPONENT = "ui/UPDATE_CONTENT_PANEL_COMPONENT";
const UPDATE_LAYOUT = "ui/UPDATE_LAYOUT";
const UPDATE_INFO_MODAL_CONTENT = "ui/UPDATE_INFO_MODAL_CONTENT";

// Action creators:
export function updateCurrentTemplate(templateName) {
  return { type: UPDATE_CURRENT_TEMPLATE, payload: templateName };
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
export function updateLayout() {
  return {
    type: UPDATE_LAYOUT,
    payload: getLayout(),
  };
}
export function updateIndoModalContent(content) {
  return {
    type: UPDATE_INFO_MODAL_CONTENT,
    payload: content,
  };
}

// Reducers:
const INITIAL_STATE = {
  activePageSlug: null,
  uiVisibility: {
    addPlaceButton: false,
    contentPanel: false,
    infoModal: false,
    inviteModal: false,
    mapCenterpoint: false,
    spotlightMask: false,
    rightSidebar: false,
  },
  contentPanelComponent: null,
  infoModalContent: {
    header: "",
    body: [],
  },
  leftSidebarComponent: null,
  currentTemplate: "map",
  isEditModeToggled: false,
  // Currently either "desktop" or "mobile"
  layout: getLayout(),
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
    case UPDATE_EDIT_MODE_TOGGLED:
      return {
        ...state,
        isEditModeToggled: action.payload,
      };
    case UPDATE_LAYOUT:
      return {
        ...state,
        layout: action.payload,
      };
    case UPDATE_INFO_MODAL_CONTENT:
      return {
        ...state,
        infoModalContent: action.payload,
      };
    default:
      return state;
  }
}
