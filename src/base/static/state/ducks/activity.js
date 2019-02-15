// Selectors:
export const activitySelector = state => {
  return state.activity;
};

// Actions:
const LOAD_ACTIVITY = "activity/SET_CONFIG";

// Action creators:
export function loadActivity(activity) {
  // Load activity in reverse chronological order.
  activity = activity.sort(
    (a, b) => new Date(b.created_datetime) - new Date(a.created_datetime),
  );
  return { type: LOAD_ACTIVITY, payload: activity };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = [];

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD_ACTIVITY:
      return action.payload;
    default:
      return state;
  }
}
