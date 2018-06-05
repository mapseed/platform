import { combineReducers } from "redux";
import uiReducer from "./ducks/ui";
import mapConfigReducer from "./ducks/map-config";
import placeConfigReducer from "./ducks/place-config";
import storyConfigReducer from "./ducks/story-config";
import leftSidebarConfigReducer from "./ducks/left-sidebar-config";
import mapLayersReducer from "./ducks/map-layers";

const reducers = combineReducers({
  ui: uiReducer,
  mapConfig: mapConfigReducer,
  mapLayers: mapLayersReducer,
  placeConfig: placeConfigReducer,
  storyConfig: storyConfigReducer,
  leftSidebarConfig: leftSidebarConfigReducer,
});

export default reducers;
