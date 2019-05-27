import PropTypes from "prop-types";

export const userPropType = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  provider_type: PropTypes.string,
  username: PropTypes.string,
  avatar_url: PropTypes.string,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      dataset: PropTypes.string.isRequired,
      dataset_slug: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      permissions: PropTypes.arrayOf(
        PropTypes.shape({
          abilities: PropTypes.arrayOf(PropTypes.string).isRequired,
          submission_set: PropTypes.string.isRequired,
        }),
      ),
    }),
  ),
  token: PropTypes.string,
  isAuthenticated: PropTypes.bool,
});

// Selectors:
export const userSelector = state => {
  return state.user;
};

export const hasGroupAbilitiesInDatasets = ({
  state,
  abilities,
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
          // All the passed abilities must exist in the array of allowed
          // abilities.
          abilities.filter(ability => perm.abilities.includes(ability))
            .length === abilities.length,
      ),
    );
export const hasUserAbilitiesInPlace = ({
  state,
  submitter,
  isSubmitterEditingSupported = false,
}) =>
  // Users are assumed to have all abilities on their own places, except for
  // the ability to edit tags.
  isSubmitterEditingSupported &&
  submitter &&
  state.user.username === submitter.username &&
  state.user.id === submitter.id;
export const hasAdminAbilities = (state, datasetSlug) =>
  state.user.groups.some(
    group =>
      group.dataset_slug === datasetSlug && group.name === "administrators",
  );
export const isInAtLeastOneGroup = (state, groupNames, datasetSlug) =>
  state.user.groups
    .filter(group => group.dataset_slug === datasetSlug)
    .map(group => group.name)
    .some(groupName => groupNames.includes(groupName));

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
  isLoaded: false,
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return action.payload;
    default:
      return state;
  }
}
