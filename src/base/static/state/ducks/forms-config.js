import PropTypes from "prop-types";

// Selectors:
export const commentFormConfigSelector = state => {
  return state.formsConfig.comments;
};

export const placeFormsConfigSelector = state => {
  return state.formsConfig.places;
};

export const formFieldsConfigSelector = state => {
  return state.formsConfig.fields;
};

export const formFieldsConfigPropType = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    autocomplete: PropTypes.bool,
    type: PropTypes.string.isRequired,
    prompt: PropTypes.string.isRequired,
    display_prompt: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    optional: PropTypes.bool.isRequired,
    content: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      }),
    ),
  }),
);

export const commentFormConfigPropType = PropTypes.shape({
  items: PropTypes.arrayOf(
    PropTypes.shape({
      prompt: PropTypes.string,
      type: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  response_name: PropTypes.string.isRequired,
  response_plural_name: PropTypes.string.isRequired,
});

export const placeFormsConfigPropType = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    datasetSlug: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }),
);

// Actions:
const LOAD = "form-config/LOAD";

// Action creators:
export function loadFormsConfig(config) {
  return { type: LOAD, payload: config };
}

// Reducers:
const INITIAL_STATE = null;

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
