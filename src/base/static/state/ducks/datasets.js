// Selectors:
export const datasetSelector = (state, datasetSlug) =>
  state.datasets.find(dataset => dataset.slug === datasetSlug);

// Actions:
const LOAD = "datasets/LOAD";

// Action creators:
export function loadDatasets(datasets) {
  return { type: LOAD, payload: datasets };
}

// Look up the tag tree and assemble all names.
export const getAllTagNamesFromTagId = ({ state, datasetSlug, tagId }) => {
  let tagNames = [];
  const traverse = id => {
    const node = state.datasets
      .find(dataset => dataset.slug === datasetSlug)
      .tags.find(tag => tag.id === id);
    if (node) {
      tagNames = tagNames.concat([node.name]);
      traverse(node.parent);
    }
  };
  traverse(tagId);

  // Traversing the tag tree produces an array in backward order, so
  // return the reversed array.
  return tagNames.reverse();
};
export const getTagFromUrl = ({ state, datasetSlug, tagUrl }) =>
  state.datasets
    .find(dataset => dataset.slug === datasetSlug)
    .tags.find(tag => tag.url === tagUrl);
export const getAllTagsForDataset = (state, datasetSlug) =>
  state.datasets
    .find(dataset => dataset.slug === datasetSlug)
    .tags.filter(tag => tag.is_enabled);
export const getColorForTag = ({ state, datasetSlug, tagUrl }) =>
  state.datasets
    .find(dataset => dataset.slug === datasetSlug)
    .tags.find(tag => tag.url === tagUrl).color;

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
