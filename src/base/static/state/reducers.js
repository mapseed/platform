import { combineReducers } from "redux";
import mapStyleReducer from "./ducks/map-style";
import mapReducer from "./ducks/map";
import placesReducer from "./ducks/places";
import uiReducer from "./ducks/ui";
import placeFiltersReducer from "./ducks/place-filters";
import leftSidebarReducer from "./ducks/left-sidebar";

import appConfigReducer from "./ducks/app-config";
import featuredPlacesConfigReducer from "./ducks/featured-places-config";
import rightSidebarConfigReducer from "./ducks/right-sidebar-config";
import supportConfigReducer from "./ducks/support-config";
import navBarConfigReducer from "./ducks/nav-bar-config";
import pagesConfigReducer from "./ducks/pages-config";
import dashboardConfigReducer from "./ducks/dashboard-config";
import userReducer from "./ducks/user";
import datasetsReducer from "./ducks/datasets";
import activityReducer from "./ducks/activity";
import customComponentsConfigReducer from "./ducks/custom-components-config";
import flavorConfigReducer from "./ducks/flavor-config";
import formsReducer from "./ducks/forms";

const reducers = combineReducers({
  places: placesReducer,
  ui: uiReducer,
  leftSidebar: leftSidebarReducer,
  placeFilters: placeFiltersReducer,
  appConfig: appConfigReducer,
  map: mapReducer,
  mapStyle: mapStyleReducer,
  featuredPlacesConfig: featuredPlacesConfigReducer,
  rightSidebarConfig: rightSidebarConfigReducer,
  supportConfig: supportConfigReducer,
  navBarConfig: navBarConfigReducer,
  pagesConfig: pagesConfigReducer,
  dashboardConfig: dashboardConfigReducer,
  user: userReducer,
  datasets: datasetsReducer,
  activity: activityReducer,
  customComponentsConfig: customComponentsConfigReducer,
  flavorConfig: flavorConfigReducer,
  forms: formsReducer,
});

export default reducers;
