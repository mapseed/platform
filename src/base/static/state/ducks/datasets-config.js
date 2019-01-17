// Selectors:
export const datasetSlugsSelector = state =>
  state.datasetsConfig.map(config => config.dataset_slug);

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
        config.dataset_slug === datasetSlug &&
        (perm.submission_set === "*" ||
          perm.submission_set === submissionSet) &&
        perm.abilities.includes(ability),
    ),
  );

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
