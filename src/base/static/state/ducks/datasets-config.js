// Selectors:
export const datasetSlugsSelector = state =>
  state.datasetsConfig.map(config => config.slug);

export const hasAnonAbilitiesInAnyDataset = ({
  state,
  abilities,
  submissionSet,
}) =>
  state.datasetsConfig.some(config =>
    config.anonymous_permissions.some(
      perm =>
        (perm.submission_set === "*" ||
          perm.submission_set === submissionSet) &&
        // All the passed abilities must exist in the array of allowed
        // abilities.
        abilities.filter(ability => perm.abilities.includes(ability)).length ===
          abilities.length,
    ),
  );
export const hasAnonAbilitiesInDataset = ({
  state,
  abilities,
  submissionSet,
  datasetSlug,
}) =>
  state.datasetsConfig.some(config =>
    config.anonymous_permissions.some(
      perm =>
        config.slug === datasetSlug &&
        (perm.submission_set === "*" ||
          perm.submission_set === submissionSet) &&
        abilities.filter(ability => perm.abilities.includes(ability)).length ===
          abilities.length,
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
