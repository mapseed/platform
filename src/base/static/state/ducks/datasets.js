import PropTypes from "prop-types";

// Selectors:
export const datasetSelector = (state, datasetSlug) =>
  state.datasets.datasetModels.find(dataset => dataset.slug === datasetSlug);

export const datasetUrlSelector = (state, datasetSlug) => {
  return state.datasets.datasetModels.find(
    dataset => dataset.slug === datasetSlug,
  ).url;
};

export const datasetsLoadStatusSelector = state => state.datasets.loadStatus;

// Actions:
const LOAD = "datasets/LOAD";
const UPDATE_LOAD_STATUS = "datasets/UPDATE_LOAD_STATUS";

// Action creators:
export function updateDatasetsLoadStatus(loadStatus) {
  return {
    type: UPDATE_LOAD_STATUS,
    payload: loadStatus,
  };
}

export function loadDatasets(datasets) {
  const getTagParents = (dataset, node) => {
    const parentNodes = [];

    const traverse = node => {
      if (node.parent) {
        const parentNode = dataset.tags.find(tag => tag.id === node.parent);
        parentNodes.push(parentNode);

        traverse(parentNode);
      }
    };
    traverse(node);

    // Traversing the tag tree produces an array in backward order, so
    // return the reversed array.
    return parentNodes.reverse();
  };

  datasets = datasets.map(dataset => {
    const tags = dataset.tags
      .map(({ is_enabled: isEnabled, ...rest }) => ({
        isEnabled,
        ...rest,
      }))
      .map(tag => {
        const parents = getTagParents(dataset, tag);

        const displayName = parents
          .map(parent => parent.name)
          .concat([tag.name]);

        return {
          ...tag,
          displayName,
        };
      });

    return {
      ...dataset,
      tags,
    };
  });

  return { type: LOAD, payload: datasets };
}

export const getTagFromUrl = ({ state, datasetSlug, tagUrl }) =>
  state.datasets.datasetModels
    .find(dataset => dataset.slug === datasetSlug)
    .tags.find(tag => tag.url === tagUrl);

export const getAllTagsForDataset = (state, datasetSlug) =>
  state.datasets.datasetModels
    .find(dataset => dataset.slug === datasetSlug)
    .tags.filter(tag => tag.isEnabled);

export const getColorForTag = ({ state, datasetSlug, tagUrl }) =>
  state.datasets.datasetModels
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
const INITIAL_STATE = {
  datasetModels: [],
  loadStatus: "unloaded",
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        datasetModels: action.payload,
      };
    case UPDATE_LOAD_STATUS:
      return {
        ...state,
        loadStatus: action.payload,
      };
    default:
      return state;
  }
}
