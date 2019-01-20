// Selectors:
export const userSelector = state => {
  return state.user;
};
export const hasGroupAbilityInDatasets = ({
  state,
  ability,
  submissionSet,
  datasetSlugs,
}) =>
  state.user.groups
    .filter(group => datasetSlugs.includes(group.dataset_slug))
    .some(group =>
      group.permissions.some(
        perm =>
          datasetSlugs.includes(group.dataset_slug) &&
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
export const hasAdminAbilities = (state, datasetSlug) =>
  state.user.groups.some(
    group =>
      group.dataset_slug === datasetSlug && group.name === "administrators",
  );

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
