import { combineReducers } from "redux";
import uiReducer from "./ducks/ui";
import mapConfigReducer from "./ducks/map-config";
import placeConfigReducer from "./ducks/place-config";
import storyConfigReducer from "./ducks/story-config";
import leftSidebarReducer from "./ducks/left-sidebar";
import rightSidebarConfigReducer from "./ducks/right-sidebar-config";
import mapDrawingToolbarReducer from "./ducks/map-drawing-toolbar";
import appConfigReducer from "./ducks/app-config";
import mapReducer from "./ducks/map";
import surveyConfigReducer from "./ducks/survey-config";

const reducers = combineReducers({
  ui: uiReducer,
  mapConfig: mapConfigReducer,
  map: mapReducer,
  placeConfig: placeConfigReducer,
  storyConfig: storyConfigReducer,
  leftSidebar: leftSidebarReducer,
  rightSidebarConfig: rightSidebarConfigReducer,
  mapDrawingToolbar: mapDrawingToolbarReducer,
  appConfig: appConfigReducer,
  surveyConfig: surveyConfigReducer,
});

export default reducers;
