import PropTypes from "prop-types";
// Selectors:
export const appConfigSelector = state => {
  return state.appConfig;
};

export const themeSelector = state => {
  return state.appConfig.theme || {};
};

export const sharingProvidersSelector = state =>
  state.appConfig.sharingProviders;

export const themePropType = PropTypes.shape({
  brand: PropTypes.shape({
    primary: PropTypes.string,
    secondary: PropTypes.string,
    tertiary: PropTypes.string,
    accent: PropTypes.string,
  }),
  bg: PropTypes.shape({
    default: PropTypes.string,
    light: PropTypes.string,
    highlighted: PropTypes.string,
  }),
  text: PropTypes.shape({
    primary: PropTypes.string,
    secondary: PropTypes.string,
    highlighted: PropTypes.string,
    headerFontFamily: PropTypes.string,
    bodyFontFamily: PropTypes.string,
    textTransform: PropTypes.string,
    titleColor: PropTypes.string,
    titleFontFamily: PropTypes.string,
  }),
  map: PropTypes.shape({
    addPlaceButtonHoverBackgroundColor: PropTypes.string,
    addPlaceButtonBackgroundColor: PropTypes.string,
  }),
  boxShadow: PropTypes.string,
});

export const appConfigPropType = PropTypes.shape({
  title: PropTypes.string.isRequired,
  meta_description: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
  api_root: PropTypes.string.isRequired,
  dataset_download: PropTypes.object,
  name: PropTypes.string,
  time_zone: PropTypes.string.isRequired,
  theme: themePropType,
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
const LOAD = "app/LOAD";

// Action creators:
export function loadAppConfig(config) {
  return { type: LOAD, payload: config };
}

// Reducers:
const INITIAL_STATE = {
  title: "",
  meta_description: "",
  api_root: "",
  time_zone: "",
  loginProviders: [
    {
      name: "google",
      provider: "google-oauth2",
    },
    {
      name: "facebook",
      provider: "facebook",
    },
  ],
  sharingProviders: [
    {
      type: "facebook",
    },
  ],
};

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
