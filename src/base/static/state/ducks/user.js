// Selectors:
export const userSelector = state => {
  return state.user;
};
export const hasGroupAbilityInAnyDataset = ({
  state,
  ability,
  submissionSet,
}) =>
  state.user.groups.some(group =>
    group.permissions.some(
      perm =>
        (perm.submission_set === "*" ||
          perm.submission_set === submissionSet) &&
        perm.abilities.includes(ability),
    ),
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
