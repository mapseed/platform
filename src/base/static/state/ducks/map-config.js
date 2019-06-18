import PropTypes from "prop-types";

// TODO: Remove this Duck, and nest this confuguration under AppConfig.map.

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

// Selectors:
export const mapConfigSelector = state => {
  return state.mapConfig;
};
export const offlineConfigSelector = state => {
  return state.mapConfig.offlineBoundingBox;
};
export const geocodeAddressBarEnabledSelector = state =>
  state.mapConfig.geocoding_bar_enabled;

// Actions:
const LOAD = "map-config/LOAD";

// Action creators:
export function loadMapConfig(config) {
  config.geocoding_bar_enabled = !!config.geocoding_bar_enabled;

  return { type: LOAD, payload: config };
}

export const mapConfigPropType = PropTypes.shape({
  geolocation_enabled: PropTypes.bool,
  geocoding_bar_enabled: PropTypes.bool,
  geocoding_engine: PropTypes.string,
  geocode_field_label: PropTypes.string,
  geocode_hint: PropTypes.arrayOf(PropTypes.number),
  geocode_bounding_box: PropTypes.arrayOf(PropTypes.number),
  offlineBoundingBox: offlineConfigPropType,
});

// Reducers:
const INITIAL_STATE = {
  geocoding_bar_enabled: false,
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
