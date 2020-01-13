// Selectors:
export const dashboardConfigSelector = state => {
  return state.dashboardConfig;
};

// Actions:
const LOAD = "dashboard-config/LOAD";

// Action creators:
export function loadDashboardConfig(dashboardConfig, datasets) {
  return {
    type: LOAD,
    payload: dashboardConfig.map(config => ({
      ...config,
      datasetUrl: (
        datasets.find(({ slug }) => slug === config.datasetSlug) || {}
      ).url,
    })),
  };
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
