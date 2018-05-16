import { combineReducers } from "redux";
import uiReducer from "./ducks/ui";
import configReducer from "./ducks/config";

const reducers = combineReducers({
  ui: uiReducer,
  config: configReducer,
});

export default reducers;
