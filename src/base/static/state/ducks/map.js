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
export const mapFilterSliderConfigSelector = state =>
  state.map.mapWidgets.filterSliders;
export const isWithMapFilterSliderSelector = state =>
  state.map.mapWidgets.filterSliders &&
  state.map.mapWidgets.filterSliders.length > 0;
export const mapRadioMenuConfigSelector = state =>
  state.map.mapWidgets.radioMenu;
export const isWithMapRadioMenuSelector = state =>
  !!state.map.mapWidgets.radioMenu;
export const measurementToolEnabledSelector = state =>
  state.map.measurementToolEnabled;
export const isMapDraggingOrZooming = state =>
  state.map.mapInteractionState.isMapDraggingOrZooming;
export const isMapTransitioning = state =>
  state.map.mapInteractionState.isMapTransitioning;
export const isMapDraggedOrZoomedByUser = state =>
  state.map.mapInteractionState.isMapDraggedOrZoomedByUser;

// Actions:
const LOAD = "map/LOAD";
export const UPDATE_MAPVIEWPORT = "map/UPDATE_MAPVIEWPORT";
const UPDATE_MAP_INTERACTION_STATE = "map/UPDATE_MAP_INTERACTION_STATE";

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

export const updateMapInteractionState = newInteractionState => {
  return {
    type: UPDATE_MAP_INTERACTION_STATE,
    payload: newInteractionState,
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
  mapInteractionState: {
    isMapTransitioning: false,
    isMapDraggingOrZooming: false,
    isMapDraggedOrZoomedByUser: true,
  },
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
      case UPDATE_MAP_INTERACTION_STATE:
        Object.assign(draft.mapInteractionState, action.payload);
        return;
    }
  });
