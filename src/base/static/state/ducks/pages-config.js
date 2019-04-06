// Selectors:
export const pagesConfigSelector = state => state.pagesConfig;
export const pageSelector = ({ state, slug, lang }) =>
  state.pagesConfig.find(
    pageConfig => pageConfig.slug === slug && pageConfig.lang === lang,
  );

// Actions:
const LOAD = "pages/LOAD";

// Action creators:
export function loadPagesConfig(config) {
  config = config.map(item => ({
    ...item,
    // Note that page content might be in array format purely for readability's
    // sake when working with it in the config.
    content: Array.isArray(item.content) ? item.content.join("") : item.content,
  }));

  return { type: LOAD, payload: config };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = [];

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return action.payload;
    default:
      return state;
  }
}
