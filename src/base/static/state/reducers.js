import { combineReducers } from "redux";
import mapReducer from "./ducks/map";
import placesReducer from "./ducks/places";
import uiReducer from "./ducks/ui";
import filters from "./ducks/filters";
import leftSidebarReducer from "./ducks/left-sidebar";

import appConfigReducer from "./ducks/app-config";
import mapConfigReducer from "./ducks/map-config";
import mapViewportReducer from "./ducks/map-viewport";
import placeConfigReducer from "./ducks/place-config";
import featuredPlacesConfigReducer from "./ducks/featured-places-config";
import rightSidebarConfigReducer from "./ducks/right-sidebar-config";
import formsConfigReducer from "./ducks/forms-config";
import supportConfigReducer from "./ducks/support-config";
import navBarConfigReducer from "./ducks/nav-bar-config";
import pagesConfigReducer from "./ducks/pages-config";
import dashboardConfigReducer from "./ducks/dashboard-config";
import userReducer from "./ducks/user";
import datasetsConfigReducer from "./ducks/datasets-config";
import datasetsReducer from "./ducks/datasets";
import activityReducer from "./ducks/activity";
import customComponentsConfigReducer from "./ducks/custom-components-config";

const reducers = combineReducers({
  places: placesReducer,
  ui: uiReducer,
  leftSidebar: leftSidebarReducer,
  filters,
  appConfig: appConfigReducer,
  mapConfig: mapConfigReducer,
  mapViewport: mapViewportReducer,
  placeConfig: placeConfigReducer,
  featuredPlacesConfig: featuredPlacesConfigReducer,
  rightSidebarConfig: rightSidebarConfigReducer,
  formsConfig: formsConfigReducer,
  supportConfig: supportConfigReducer,
  navBarConfig: navBarConfigReducer,
  pagesConfig: pagesConfigReducer,
  dashboardConfig: dashboardConfigReducer,
  user: userReducer,
  datasetsConfig: datasetsConfigReducer,
  datasets: datasetsReducer,
  activity: activityReducer,
  map: mapReducer,
  customComponentsConfig: customComponentsConfigReducer,
});

export default reducers;
