import PropTypes from "prop-types";

// Selectors:
export const rightSidebarConfigSelector = state => {
  return state.rightSidebarConfig;
};

export const isRightSidebarEnabledSelector = state => {
  return !!state.rightSidebarConfig.is_enabled;
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
const LOAD = "right-sidebar/LOAD";

// Action creators:
export function loadRightSidebarConfig(config) {
  return { type: LOAD, payload: config };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = {};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
