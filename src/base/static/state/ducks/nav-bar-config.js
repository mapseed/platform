import PropTypes from "prop-types";
// Selectors:
export const navBarConfigSelector = state => {
  return state.navBarConfig;
};

export const navBarConfigPropType = PropTypes.arrayOf(
  PropTypes.shape({
    title: PropTypes.string,
    type: PropTypes.string.isRequired,
    url: PropTypes.string,
    start_page: PropTypes.bool,
    name: PropTypes.string,
    component: PropTypes.string,
  }),
);

// Actions:
const LOAD = "navBar/LOAD";

// Action creators:
export function loadNavBarConfig(config) {
  return { type: LOAD, payload: config };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = [];

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return action.payload;
    default:
      return state;
  }
}
