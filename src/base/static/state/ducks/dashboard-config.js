import PropTypes from "prop-types";
// Selectors:
export const dashboardConfigSelector = state => {
  return state.dashboardConfig;
};

export const dashboardConfigPropType = PropTypes.arrayOf(
  PropTypes.shape({
    dastasetId: PropTypes.string,
    datasetOwner: PropTypes.string,
    surveyMetrics: PropTypes.shape({
      categories: PropTypes.bool,
      demographics: PropTypes.bool,
      wards: PropTypes.bool,
    }),
  }),
);

// Actions:
const LOAD = "dashboard-config/LOAD";

// Action creators:
export function loadDashboardConfig(dashboardConfig) {
  return { type: LOAD, payload: dashboardConfig };
}

const INITIAL_STATE = [];

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return action.payload;
    default:
      return state;
  }
}
