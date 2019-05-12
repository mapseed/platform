import { Mixpanel } from "../../utils/mixpanel";

// Selectors:
export const analysisTargetFeaturesSelector = (targetUrl, state) => {
  try {
    return state.analysis.find(
      analysisTarget => analysisTarget.targetUrl === targetUrl,
    ).data.features;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(
      "Error: no features available for analysis target url",
      targetUrl,
    );
    Mixpanel.track("Error", {
      message: `not able to find features for analysis target url ${targetUrl}`,
      error: e,
    });

    return [];
  }
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
