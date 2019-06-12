import PropTypes from "prop-types";
// PropTypes

export const featuredPlacesPropType = PropTypes.arrayOf(
  PropTypes.shape({
    placeId: PropTypes.number.isRequired,
    zoom: PropTypes.number,
    hasCustomZoom: PropTypes.bool,
    panTo: PropTypes.arrayOf(PropTypes.number),
    visibleLaygerGroupIds: PropTypes.arrayOf(PropTypes.string),
    previous: PropTypes.string,
    next: PropTypes.string,
    spotlight: PropTypes.bool.isRequired,
    sidebarIconUrl: PropTypes.string,
  }).isRequired,
).isRequired;

export const featuredPlacesConfigPropType = PropTypes.shape({
  name: PropTypes.string,
  header: PropTypes.string,
  description: PropTypes.string,
  places: featuredPlacesPropType,
});

// Selectors:
export const featuredPlacesConfigSelector = state => {
  return state.featuredPlacesConfig;
};

export const featuredPlacesSelector = state =>
  state.featuredPlacesConfig.places;

// Actions:
const LOAD = "featured-places-config/LOAD";

// Action creators:
export function loadFeaturedPlacesConfig(config) {
  const numChapters = config.order.length;
  return {
    type: LOAD,
    payload: {
      header: config.header,
      name: config.name,
      description: config.description,
      places: config.order.map((featuredPlace, i) => {
        return {
          placeId: featuredPlace.placeId,
          zoom: featuredPlace.zoom || config.default_zoom,
          hasCustomZoom: !!featuredPlace.zoom,
          panTo: featuredPlace.pan_to || null,
          visibleLayerGroupIds:
            featuredPlace.visibleLayerGroupIds || config.visibleLayerGroupIds,
          previous: config.order[(i - 1 + numChapters) % numChapters].url,
          next: config.order[(i + 1) % numChapters].url,
          spotlight: featuredPlace.spotlight === false ? false : true,
          sidebarIconUrl: featuredPlace.sidebar_icon_url,
        };
      }),
    },
  };
}

// return { type: LOAD, payload: { config, } };
// }

// Reducers:
const INITIAL_STATE = { places: [] };
// config: [],
// chapters: [],
// };

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
