import PropTypes from "prop-types";
// Selectors:
export const appConfigSelector = state => {
  return state.appConfig;
};

export const appConfigPropType = PropTypes.shape({
  title: PropTypes.string.isRequired,
  meta_description: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
  api_root: PropTypes.string.isRequired,
  dataset_download: PropTypes.object,
  name: PropTypes.string,
  time_zone: PropTypes.string.isRequired,
  isShowingMobileUserMenu: PropTypes.bool,
  languages: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  logo: PropTypes.string,
  show_name_in_header: PropTypes.bool,
});

// Actions:
const SET_CONFIG = "app/SET_CONFIG";

// Action creators:
export function setAppConfig(config) {
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
