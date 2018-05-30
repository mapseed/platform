import { combineReducers } from "redux";
import uiReducer from "./ducks/ui";
import configReducer from "./ducks/config";
import mapLayersReducer from "./ducks/map-layers";

const reducers = combineReducers({
  ui: uiReducer,
  config: configReducer,
  mapLayers: mapLayersReducer,
});

export default reducers;
