import PropTypes from "prop-types";

// Selectors:
export const commentsSurveyConfigSelector = state => {
  return state.surveyConfig.comments;
};

export const surveyFormsConfigSelector = state => {
  return state.surveyConfig.forms;
};

export const commentsSurveyConfigPropType = PropTypes.shape({
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

export const surveyFormsConfigPropType = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    datasetId: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }),
);

// Actions:
const LOAD = "survey-config/LOAD";

// Action creators:
export function setSurveyConfig(config) {
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
