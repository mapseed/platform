import produce from "immer";
import PropTypes from "prop-types";

// PropTypes:

export const offlineConfigPropType = PropTypes.shape({
  southWest: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
  northEast: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
});

export const mapConfigPropType = PropTypes.shape({
  measurementToolEnabled: PropTypes.bool,
  geolocationEnabled: PropTypes.bool,
  geocodingBarEnabled: PropTypes.bool,
  geocodingEngine: PropTypes.string,
  geocodeFieldLabel: PropTypes.string,
  geocodeHint: PropTypes.arrayOf(PropTypes.number),
  geocodeBoundingBox: PropTypes.arrayOf(PropTypes.number),
  offlineBoundingBox: offlineConfigPropType,
  scrollZoomAroundCenter: PropTypes.bool,
  defaultMapViewport: PropTypes.object.isRequired,
  mapWidgets: PropTypes.object.isRequired,
}).isRequired;

// Selectors:
export const mapConfigSelector = state => {
  return state.map;
};

export const mapViewportSelector = state => {
  return state.map.mapViewport;
};

export const offlineConfigSelector = state => {
  return state.map.offlineBoundingBox;
};
export const geocodeAddressBarEnabledSelector = state =>
  state.map.geocodingBarEnabled;
export const mapWidgetsSelector = state => {
  return state.map.mapWidgets;
};
export const measurementToolEnabledSelector = state =>
  state.map.measurementToolEnabled;

// Actions:
const LOAD = "map/LOAD";
export const UPDATE_MAPVIEWPORT = "map/UPDATE_MAPVIEWPORT";

// Action creators:
export function loadMapConfig(config) {
  return { type: LOAD, payload: config };
}

export const updateMapViewport = newMapViewport => {
  return {
    type: UPDATE_MAPVIEWPORT,
    payload: newMapViewport,
  };
};

// Reducers:
const INITIAL_STATE = {
  measurementToolEnabled: false,
  geocodingBarEnabled: false,
  scrollZoomAroundCenter: false,
  mapViewport: {},
  defaultMapViewport: {
    zoom: 10,
    latitude: 0,
    longitude: 0,
    maxZoom: 18,
    minZoom: 1,
    pitch: 15,
  },
  mapWidgets: {},
};

export default (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    switch (action.type) {
      case LOAD:
        Object.assign(draft, action.payload);
        draft.defaultMapViewport = action.payload.mapViewport;
        draft.mapViewport = action.payload.mapViewport;
        return;
      case UPDATE_MAPVIEWPORT:
        Object.assign(draft.mapViewport, action.payload);
        return;
    }
  });
