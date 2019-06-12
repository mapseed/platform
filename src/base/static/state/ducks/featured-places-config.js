import PropTypes from "prop-types";
// PropTypes

// HACK: FeaturedSites cannot set arbitrary map state, so to add more flexibility, we
// added the panTo and centerpoint options which render the featured place
// geometry invisibly.

// The way it works is:

// * the placeId identifies the Place (which is rendered in the detail view)

// * the panTo and zoom options allow custom map state to be set, overriding
//   what the map would normally set based on the Place location and geometry
//   type

// * the geometry for the featured place is designed to be rendered invisibly
//   (in the case of the argentina flavor it's actually 0-opacity linestrings)

// TODO: One change we could make is to not use the 0-opacity linestrings as
// placeholders (which is truly a hack). A better approach is to use an
// icon-image that doesn't actually exist, as Mapbox just won't render anything
// if it can't find an image.

// We have been using this convention elsewhere to convey that we intend for no
// icon to render:
// icon-image: __no-icon-image__

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
