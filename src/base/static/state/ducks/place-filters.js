// Selectors:
export const placeFiltersSelector = state => {
  return state.placeFilters;
};

// Actions:
const UPDATE = "placeFilters/UPDATE";

// Action creators:
export function updatePlaceFilters(placeFilters) {
  return { type: UPDATE, payload: placeFilters };
}

// Reducers:
const INITIAL_STATE = [];

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE:
      return action.payload;
    default:
      return state;
  }
}
