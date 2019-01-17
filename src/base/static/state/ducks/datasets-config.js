// Selectors:
export const datasetConfigSelector = (state, id) => {
  return state.datasetsConfig.filter(datasetConfig => datasetConfig.id === id);
};
export const hasAnonAbilityInAnyDataset = ({ state, ability, submissionSet }) =>
  state.datasetsConfig.some(config =>
    config.anonymous_permissions.some(
      perm =>
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
