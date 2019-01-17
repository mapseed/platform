import { combineReducers } from "redux";
import mapReducer from "./ducks/map";
import placesReducer from "./ducks/places";
import uiReducer from "./ducks/ui";
import filters from "./ducks/filters";
import leftSidebarReducer from "./ducks/left-sidebar";
import mapDrawingToolbarReducer from "./ducks/map-drawing-toolbar";

import appConfigReducer from "./ducks/app-config";
import mapConfigReducer from "./ducks/map-config";
import placeConfigReducer from "./ducks/place-config";
import storyConfigReducer from "./ducks/story-config";
import rightSidebarConfigReducer from "./ducks/right-sidebar-config";
import formsConfigReducer from "./ducks/forms-config";
import supportConfigReducer from "./ducks/support-config";
import navBarConfigReducer from "./ducks/nav-bar-config";
import pagesConfigReducer from "./ducks/pages-config";
import dashboardConfigReducer from "./ducks/dashboard-config";
import userReducer from "./ducks/user";
import datasetsConfigReducer from "./ducks/datasets-config";

const reducers = combineReducers({
  map: mapReducer,
  places: placesReducer,
  ui: uiReducer,
  leftSidebar: leftSidebarReducer,
  mapDrawingToolbar: mapDrawingToolbarReducer,
  filters,
  appConfig: appConfigReducer,
  mapConfig: mapConfigReducer,
  placeConfig: placeConfigReducer,
  storyConfig: storyConfigReducer,
  rightSidebarConfig: rightSidebarConfigReducer,
  formsConfig: formsConfigReducer,
  supportConfig: supportConfigReducer,
  navBarConfig: navBarConfigReducer,
  pagesConfig: pagesConfigReducer,
  dashboardConfig: dashboardConfigReducer,
  user: userReducer,
  datasetsConfig: datasetsConfigReducer,
});

export default reducers;
