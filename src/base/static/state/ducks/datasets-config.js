// Selectors:
export const datasetSlugsSelector = state =>
  state.datasetsConfig.map(config => config.slug);

export const hasAnonAbilityInAnyDataset = ({ state, ability, submissionSet }) =>
  state.datasetsConfig.some(config =>
    config.anonymous_permissions.some(
      perm =>
        (perm.submission_set === "*" ||
          perm.submission_set === submissionSet) &&
        perm.abilities.includes(ability),
    ),
  );
export const hasAnonAbilityInDataset = ({
  state,
  ability,
  submissionSet,
  datasetSlug,
}) =>
  state.datasetsConfig.some(config =>
    config.anonymous_permissions.some(
      perm =>
        config.slug === datasetSlug &&
        (perm.submission_set === "*" ||
          perm.submission_set === submissionSet) &&
        perm.abilities.includes(ability),
    ),
  );
// Look up the tag tree and assemble all labels.
export const getAllTagNamesFromId = ({ state, datasetSlug, tagId }) => {
  let tagNames = [];
  const traverse = id => {
    const node = state.datasetsConfig
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
export const getAllTagsForDataset = (state, datasetSlug) =>
  state.datasetsConfig.find(datasetConfig => datasetConfig.slug === datasetSlug)
    .tags;
export const getColorForTagId = ({ state, datasetSlug, tagId }) =>
  state
    .datasetsConfig.find(datasetConfig => datasetConfig.slug === datasetSlug)
    .tags.find(tag => tag.id === tagId).color;

// Actions:
const LOAD = "datasets-config/LOAD";

// Action creators:
export function loadDatasetsConfig(datasetsConfig) {
  return { type: LOAD, payload: datasetsConfig };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = null;

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return action.payload;
    default:
      return state;
  }
}
