import PropTypes from "prop-types";

// Selectors:
export const mapConfigSelector = state => {
  return state.mapConfig;
};
export const mapLayerGroupsSelector = state => {
  return state.mapConfig.layerGroups;
};
export const mapPlaceLayersSelector = state => {
  return state.mapConfig.layers.filter(
    layer => layer.type && layer.type === "place",
  );
};

// Actions:
const SET_CONFIG = "map-config/SET";

// Action creators:
export function setMapConfig(config) {
  return { type: SET_CONFIG, payload: config };
}

export const mapConfigPropType = PropTypes.shape({
  geolocation_enabled: PropTypes.bool,
  geocoding_bar_enabled: PropTypes.bool,
  geocoding_engine: PropTypes.string,
  geocode_field_label: PropTypes.string,
  geocode_hint: PropTypes.arrayOf(PropTypes.number),
  geocode_bounding_box: PropTypes.arrayOf(PropTypes.number),
  options: PropTypes.shape({
    mapViewport: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      zoom: PropTypes.number.isRequired,
      pitch: PropTypes.number,
      bearing: PropTypes.number,
      minZoom: PropTypes.number,
      maxZoom: PropTypes.number,
    }).isRequired,
    drawing_enabled: PropTypes.bool,
  }).isRequired,
  mapboxSources: PropTypes.objectOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      tiles: PropTypes.arrayOf(PropTypes.string),
      tileSize: PropTypes.number,
      attribution: PropTypes.string,
      data: PropTypes.string,
    }),
  ).isRequired,
  layerGroups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      interactive: PropTypes.bool,
      datasetSlug: PropTypes.string,
      visibleDefault: PropTypes.bool,
      basemap: PropTypes.bool,
      mapboxLayers: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired,
          source: PropTypes.string.isRequired,
          filter: PropTypes.array,
          "source-layer": PropTypes.string,
          paint: PropTypes.object,
          layout: PropTypes.object,
        }),
      ).isRequired,
      mapboxFocusedLayers: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired,
          source: PropTypes.string.isRequired,
          filter: PropTypes.array,
          "source-layer": PropTypes.string,
          paint: PropTypes.object,
          layout: PropTypes.object,
        }),
      ),
    }),
  ).isRequired,
});

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = null;

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_CONFIG:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
