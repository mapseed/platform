import PropTypes from "prop-types";
// Selectors:
export const filtersSelector = state => {
  return state.filters;
};

export const filtersPropType = PropTypes.arrayOf(
  PropTypes.shape({
    formId: PropTypes.string, // same as location_type
    datasetSlug: PropTypes.string,
  }),
);

// Actions:
const UPDATE = "filters/UPDATE";

// Action creators:
export function updateFilters(filters) {
  return { type: UPDATE, payload: filters };
}

const INITIAL_STATE = [];

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE:
      return action.payload;
    default:
      return state;
  }
}
