import PropTypes from "prop-types";

// Selectors:
export const placeConfigSelector = state => {
  return state.placeConfig;
};

export const placeConfigPropType = PropTypes.shape({
  anonymous_name: PropTypes.string.isRequired,
  action_text: PropTypes.string.isRequired,
  place_detail: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  list: PropTypes.shape({
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        image_name: PropTypes.string,
        type: PropTypes.string,
      }),
    ),
  }),
});

// Actions:
const SET_CONFIG = "place-config/SET";

// Action creators:
export function setPlaceConfig(config) {
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
