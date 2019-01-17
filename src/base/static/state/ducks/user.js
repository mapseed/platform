// Selectors:
export const userSelector = state => {
  return state.user;
};
export const hasGroupAbilityInAnyDataset = ({
  state,
  ability,
  submissionSet,
  datasetSlugs,
}) =>
  state.user.groups
    // Limit to datasets used on this flavor only.
    .filter(group => datasetSlugs.includes(group.dataset_slug))
    .some(group =>
      group.permissions.some(
        perm =>
          (perm.submission_set === "*" ||
            perm.submission_set === submissionSet) &&
          perm.abilities.includes(ability),
      ),
    );
export const hasGroupAbilityInDataset = ({
  state,
  ability,
  submissionSet,
  datasetSlug,
}) =>
  state.user.groups.some(group =>
    group.permissions.some(
      perm =>
        group.dataset_slug === datasetSlug &&
        (perm.submission_set === "*" ||
          perm.submission_set === submissionSet) &&
        perm.abilities.includes(ability),
    ),
  );
export const hasUserAbilityInPlace = ({
  state,
  submitter,
  isSubmitterEditingSupported = false,
}) =>
  // Users are assumed to have all abilities on their own places.
  isSubmitterEditingSupported &&
  submitter &&
  state.user.username === submitter.username &&
  state.user.provider_id === submitter.provider_id;

// Actions:
const LOAD = "user/LOAD";

// Action creators:
export function loadUser(user) {
  return { type: LOAD, payload: user };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = {
  groups: [],
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return action.payload;
    default:
      return state;
  }
}
