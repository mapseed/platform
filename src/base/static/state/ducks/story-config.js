import PropTypes from "prop-types";
// PropType

export const storyChaptersPropType = PropTypes.arrayOf(
  PropTypes.shape({
    placeId: PropTypes.string.isRequired,
    zoom: PropTypes.number.isRequired,
    hasCustomZoom: PropTypes.bool.isRequired,
    panTo: PropTypes.string,
    visibleLaygerGroupIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    previous: PropTypes.string.isRequired,
    next: PropTypes.string.isRequired,
    spotlight: PropTypes.bool.isRequired,
    sidebarIconUrl: PropTypes.string,
  }).isRequired,
).isRequired;

export const storyConfigPropType = PropTypes.arrayOf(
  PropTypes.shape({
    name: PropTypes.string,
    header: PropTypes.string,
    description: PropTypes.string,
    chapters: storyChaptersPropType,
  }),
);

// Selectors:
export const storyConfigSelector = state => {
  return state.storyConfig.config;
};

export const storyChaptersSelector = state => state.storyConfig.chapters;

// Actions:
const LOAD = "story-config/LOAD";

// Action creators:
export function loadStoryConfig(config = []) {
  const chapters = config.reduce((flat, toFlatten) => {
    return flat.concat(toFlatten.chapters);
  }, []);

  return { type: LOAD, payload: { config, chapters } };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = {
  config: null,
  chapters: [],
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
