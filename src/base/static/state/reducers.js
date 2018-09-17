import { combineReducers } from "redux";
import uiReducer from "./ducks/ui";
import mapConfigReducer from "./ducks/map-config";
import placeConfigReducer from "./ducks/place-config";
import storyConfigReducer from "./ducks/story-config";
import leftSidebarConfigReducer from "./ducks/left-sidebar-config";
import rightSidebarConfigReducer from "./ducks/right-sidebar-config";
import mapDrawingToolbarReducer from "./ducks/map-drawing-toolbar";
import appConfigReducer from "./ducks/app-config";
import mapReducer from "./ducks/map";

const reducers = combineReducers({
  ui: uiReducer,
  mapConfig: mapConfigReducer,
  map: mapReducer,
  placeConfig: placeConfigReducer,
  storyConfig: storyConfigReducer,
  leftSidebarConfig: leftSidebarConfigReducer,
  rightSidebarConfig: rightSidebarConfigReducer,
  mapDrawingToolbar: mapDrawingToolbarReducer,
  appConfig: appConfigReducer,
});

export default reducers;
