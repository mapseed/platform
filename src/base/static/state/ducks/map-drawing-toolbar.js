import constants from "../../constants";

// Selectors:
export const visibleDrawingToolsSelector = state => {
  return state.mapDrawingToolbar.visibleDrawingTools;
};
export const markerPanelVisibilitySelector = state => {
  return state.mapDrawingToolbar.isMarkerPanelVisible;
};
export const activeDrawingToolSelector = state => {
  return state.mapDrawingToolbar.activeDrawingTool;
};
export const activeMarkerSelector = state => {
  return state.mapDrawingToolbar.activeMarker;
};
export const activeGeometryIdSelector = state => {
  return state.mapDrawingToolbar.activeGeometryId;
};
export const activeColorpickerSelector = state => {
  return state.mapDrawingToolbar.activeColorpicker;
};
export const geometryStyleSelector = state => {
  return state.mapDrawingToolbar.geometryStyle;
};

// Actions:
const SET_VISIBLE_DRAWING_TOOLS =
  "map-drawing-toolbar/SET_VISIBLE_DRAWING_TOOLS";
const SET_MARKER_PANEL_VISIBILIY =
  "map-drawing-toolbar/SET_MARKER_PANEL_VISIBILITY";
const SET_ACTIVE_DRAWING_TOOL = "map-drawing-toolbar/SET_ACTIVE_DRAWING_TOOL";
const SET_ACTIVE_MARKER = "map-drawing-toolbar/SET_ACTIVE_MARKER";
const SET_ACTIVE_GEOMETRY_ID = "map-drawing-toolbar/SET_ACTIVE_GEOMETRY_ID";
const SET_ACTIVE_COLORPICKER = "map-drawing-toolbar/SET_ACTIVE_COLORPICKER";
const SET_GEOMETRY_STYLE = "map-drawing-toolbar/SET_GEOMETRY_STYLE";

// Action creators:
export function setVisibleDrawingTools(visibleDrawingTools) {
  return { type: SET_VISIBLE_DRAWING_TOOLS, payload: visibleDrawingTools };
}
export function setMarkerPanelVisibility(isVisible) {
  return { type: SET_MARKER_PANEL_VISIBILIY, payload: isVisible };
}
export function setActiveDrawingTool(activeDawingTool) {
  return { type: SET_ACTIVE_DRAWING_TOOL, payload: activeDawingTool };
}
export function setActiveMarker(activeMarker) {
  return { type: SET_ACTIVE_MARKER, payload: activeMarker };
}
export function setActiveGeometryId(activeGeometryId) {
  return { type: SET_ACTIVE_GEOMETRY_ID, payload: activeGeometryId };
}
export function setActiveColorpicker(activeColorpicker) {
  return { type: SET_ACTIVE_COLORPICKER, payload: activeColorpicker };
}
export function setGeometryStyle(geometryStyle) {
  return { type: SET_GEOMETRY_STYLE, payload: geometryStyle };
}

// Reducers:
const INITIAL_STATE = {
  visibleDrawingTools: [],
  activeDrawingTool: null,
  activeMarker: null,
  activeGeometryId: null,
  activeColorpicker: null,
  isMarkerPanelVisible: false,
  geometryStyle: {
    [constants.LINE_COLOR_PROPERTY_NAME]: constants.DRAW_DEFAULT_LINE_COLOR,
    [constants.LINE_OPACITY_PROPERTY_NAME]: constants.DRAW_DEFAULT_LINE_OPACITY,
    [constants.FILL_COLOR_PROPERTY_NAME]: constants.DRAW_DEFAULT_FILL_COLOR,
    [constants.FILL_OPACITY_PROPERTY_NAME]: constants.DRAW_DEFAULT_FILL_OPACITY,
  },
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_VISIBLE_DRAWING_TOOLS:
      return {
        ...state,
        visibleDrawingTools: action.payload,
      };
    case SET_MARKER_PANEL_VISIBILIY:
      return {
        ...state,
        isMarkerPanelVisible: action.payload,
      };
    case SET_ACTIVE_DRAWING_TOOL:
      return {
        ...state,
        activeDrawingTool: action.payload,
      };
    case SET_ACTIVE_MARKER:
      return {
        ...state,
        activeMarker: action.payload,
      };
    case SET_ACTIVE_GEOMETRY_ID:
      return {
        ...state,
        activeGeometryId: action.payload,
      };
    case SET_ACTIVE_COLORPICKER:
      return {
        ...state,
        activeColorpicker: action.payload,
      };
    case SET_GEOMETRY_STYLE:
      return {
        ...state,
        geometryStyle: {
          ...state.geometryStyle,
          ...action.payload,
        },
      };
    default:
      return state;
  }
}
