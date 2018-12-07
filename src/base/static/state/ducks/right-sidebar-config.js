import PropTypes from "prop-types";

// Selectors:
export const rightSidebarConfigSelector = state => {
  return state.rightSidebarConfig;
};

export const rightSidebarConfigPropType = PropTypes.shape({
  config: PropTypes.shape({
    description: PropTypes.string,
    groupings: PropTypes.arrayOf(
      PropTypes.shape({
        content: PropTypes.arrayOf(
          PropTypes.shape({
            icon: PropTypes.string,
            label: PropTypes.string.isRequired,
            swatch: PropTypes.string,
          }),
        ),
        title: PropTypes.string,
      }),
    ),
    title: PropTypes.string,
  }),
});

// Actions:
const SET_CONFIG = "right-sidebar/SET_CONFIG";

// Action creators:
export function setRightSidebarConfig(config) {
  return { type: SET_CONFIG, payload: config };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = null;

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_CONFIG:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
