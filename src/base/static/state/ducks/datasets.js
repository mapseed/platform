// Selectors:
export const datasetSelector = (state, datasetSlug) =>
  state.datasets.find(dataset => dataset.slug === datasetSlug);

// Actions:
const LOAD = "datasets/LOAD";

// Action creators:
export function loadDatasets(datasets) {
  return { type: LOAD, payload: datasets };
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
