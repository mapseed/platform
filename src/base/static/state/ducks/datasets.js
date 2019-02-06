import PropTypes from "prop-types";

// Selectors:
export const datasetSelector = (state, datasetSlug) =>
  state.datasets.find(dataset => dataset.slug === datasetSlug);

export const datasetUrlSelector = (state, datasetSlug) =>
  state.datasets.find(dataset => dataset.slug === datasetSlug).url;

// Actions:
const LOAD = "datasets/LOAD";

// Action creators:
export function loadDatasets(datasets) {
  const getTagChildren = (dataset, node) => {
    const childNodes = [];

    const traverse = (dataset, node) => {
      if (node.parent) {
        const newNode = dataset.tags.find(
          childTag => childTag.id === node.parent,
        );
        childNodes.push(newNode);

        traverse(dataset, newNode);
      }
    };
    traverse(dataset, node);

    // Traversing the tag tree produces an array in backward order, so
    // return the reversed array.
    return childNodes.reverse();
  };

  datasets = datasets.map(dataset => {
    dataset.tags = dataset.tags
      .map(({ is_enabled: isEnabled, ...rest }) => ({
        isEnabled,
        ...rest,
      }))
      .map(tag => {
        const children = getTagChildren(dataset, tag);

        tag.children = children;
        tag.displayName = children.map(child => child.name).concat([tag.name]);

        return tag;
      });

    return dataset;
  });

  return { type: LOAD, payload: datasets };
}

export const getTagFromUrl = ({ state, datasetSlug, tagUrl }) =>
  state.datasets
    .find(dataset => dataset.slug === datasetSlug)
    .tags.find(tag => tag.url === tagUrl);

export const getAllTagsForDataset = (state, datasetSlug) =>
  state.datasets
    .find(dataset => dataset.slug === datasetSlug)
    .tags.filter(tag => tag.isEnabled);

export const getColorForTag = ({ state, datasetSlug, tagUrl }) =>
  state.datasets
    .find(dataset => dataset.slug === datasetSlug)
    .tags.find(tag => tag.url === tagUrl).color;

export const tagPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  parent: PropTypes.number,
  url: PropTypes.string.isRequired,
  displayName: PropTypes.arrayOf(PropTypes.string).isRequired,
}).isRequired;

export const placeTagPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  note: PropTypes.string,
  tag: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
});

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
