// Selectors:
export const storyConfigSelector = state => {
  return state.storyConfig.config;
};

export const storyChaptersSelector = state => state.storyConfig.chapters;

// Actions:
const LOAD = "story-config/LOAD";

// Action creators:
export function loadStoryConfig(config = {}) {
  const chapters = Object.values(config).reduce((flat, toFlatten) => {
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
