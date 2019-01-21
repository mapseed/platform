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
export const getTagsFromChildTag = (state, datasetSlug, placeTag) => {
  let tags = [];
  const traverse = tagId => {
    const node = state.datasetsConfig
      .find(dataset => dataset.slug === datasetSlug)
      .tags.find(tag => tag.id === tagId);
    if (node) {
      tags = tags.concat([node]);
      traverse(node.parent);
    }
  };
  traverse(placeTag.id);

  // Traversing the tag tree produces an array of tags in backward order, so
  // return the reversed array.
  return tags.reverse();
};
export const getAllTagsForDataset = (state, datasetSlug) =>
  state.datasetsConfig.find(datasetConfig => datasetConfig.slug === datasetSlug)
    .tags;

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
