import { combineReducers } from "redux";
import mapReducer from "./ducks/map";
import placesReducer from "./ducks/places";
import uiReducer from "./ducks/ui";
import leftSidebarReducer from "./ducks/left-sidebar";
import mapDrawingToolbarReducer from "./ducks/map-drawing-toolbar";

import appConfigReducer from "./ducks/app-config";
import mapConfigReducer from "./ducks/map-config";
import placeConfigReducer from "./ducks/place-config";
import storyConfigReducer from "./ducks/story-config";
import rightSidebarConfigReducer from "./ducks/right-sidebar-config";
import surveyConfigReducer from "./ducks/survey-config";
import supportConfigReducer from "./ducks/support-config";
import navBarConfigReducer from "./ducks/nav-bar-config";
import pagesConfigReducer from "./ducks/pages-config";

const reducers = combineReducers({
  map: mapReducer,
  places: placesReducer,
  ui: uiReducer,
  leftSidebar: leftSidebarReducer,
  mapDrawingToolbar: mapDrawingToolbarReducer,

  appConfig: appConfigReducer,
  mapConfig: mapConfigReducer,
  placeConfig: placeConfigReducer,
  storyConfig: storyConfigReducer,
  rightSidebarConfig: rightSidebarConfigReducer,
  surveyConfig: surveyConfigReducer,
  supportConfig: supportConfigReducer,
  navBarConfig: navBarConfigReducer,
  pagesConfig: pagesConfigReducer,
});

export default reducers;
