// Selectors:
export const rightSidebarConfigSelector = state => {
  return state.rightSidebarConfig;
};

export const isRightSidebarEnabledSelector = state => {
  return !!state.rightSidebarConfig.is_enabled;
};

// Actions:
const LOAD = "analysis/LOAD";

// Action creators:
export function loadAnalysisTargets(targets) {
  return { type: LOAD, payload: targets };
}

// Reducers:
const INITIAL_STATE = [];

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return action.payload;
    default:
      return state;
  }
}
