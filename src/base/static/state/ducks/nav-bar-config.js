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
const SET_CONFIG = "navBar/SET_CONFIG";

// Action creators:
export function setNavBarConfig(config) {
  return { type: SET_CONFIG, payload: config };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = null;

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_CONFIG:
      return action.payload;
    default:
      return state;
  }
}
