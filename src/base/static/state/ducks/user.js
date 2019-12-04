import PropTypes from "prop-types";
import { createSelector } from "reselect";

import { datasetsSelector } from "./datasets";

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
export const userSelector = ({ user }) => user;

// Determine whether the current user has permission for the passed ability and
// submission set in the target dataset, either as a member of a group or
// anonymously.
// TODO: Replace anonymous permissions with origin permissions once we begin
// serializing them.
const testAllPermissionsForDataset = ({
  targetDatasetUrl,
  anonymousPermissions,
  groups,
  submissionSet,
  abilities,
}) => {
  const groupPermissions = groups
    .filter(({ dataset: datasetUrl }) => datasetUrl === targetDatasetUrl)
    .map(({ permissions }) => permissions)
    .reduce((flat, toFlatten) => flat.concat(toFlatten), []);

  return groupPermissions.concat(anonymousPermissions).some(
    ({ abilities: allowedAbilities, submission_set }) =>
      (submission_set === "*" || submission_set === submissionSet) &&
      // All of the passed abilities must be allowed.
      abilities.filter(ability => allowedAbilities.includes(ability)).length ===
        abilities.length,
  );
};

export const datasetsWithCreatePlacesAbilitySelector = createSelector(
  [datasetsSelector, userSelector],
  (datasets, { groups }) =>
    datasets.filter(({ url: targetDatasetUrl, anonymousPermissions }) =>
      testAllPermissionsForDataset({
        targetDatasetUrl,
        anonymousPermissions,
        groups,
        submissionSet: "places",
        abilities: ["create"],
      }),
    ),
);

export const datasetsWithUpdatePlacesAbilitySelector = createSelector(
  [datasetsSelector, userSelector],
  (datasets, { groups }) =>
    datasets.filter(({ url: targetDatasetUrl, anonymousPermissions }) =>
      testAllPermissionsForDataset({
        targetDatasetUrl,
        anonymousPermissions,
        groups,
        submissionSet: "places",
        abilities: ["update"],
      }),
    ),
);

export const datasetsWithAccessProtectedPlacesAbilitySelector = createSelector(
  [datasetsSelector, userSelector],
  (datasets, { groups }) =>
    datasets.filter(({ url: targetDatasetUrl, anonymousPermissions }) =>
      testAllPermissionsForDataset({
        targetDatasetUrl,
        anonymousPermissions,
        groups,
        submissionSet: "places",
        abilities: ["can_access_protected"],
      }),
    ),
);

export const datasetsWithEditTagsAbilitySelector = createSelector(
  [datasetsSelector, userSelector],
  (datasets, { groups }) =>
    datasets.filter(({ url: targetDatasetUrl, anonymousPermissions }) =>
      testAllPermissionsForDataset({
        targetDatasetUrl,
        anonymousPermissions,
        groups,
        submissionSet: "tags",
        abilities: ["update", "destroy", "create"],
      }),
    ),
);

export const hasAdminAbilitiesSelector = (state, dataset) =>
  state.user.groups.some(
    ({ dataset: groupDataset, name }) =>
      groupDataset === dataset && name === "administrators",
  );

// Actions:
const LOAD = "user/LOAD";

// Action creators:
export function loadUser(user, datasets) {
  return {
    type: LOAD,
    payload: user,
  };
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
