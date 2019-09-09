// TODO: Move language configuration from AppView into this duck.
// TODO: Dissolve app-config into this duck.

// Selectors:
export const placeFiltersConfigSelector = state =>
  state.flavorConfig.placeFilters;
export const isWithPlaceFilterWidgetSelector = state =>
  state.flavorConfig.placeFilters.length > 0 &&
  state.flavorConfig.usePlaceFilterWidget;

// Actions:
const LOAD = "flavorConfig/LOAD";

// Action creators:
export function loadFlavorConfig(config) {
  return { type: LOAD, payload: config };
}

// Reducers:
const INITIAL_STATE = {
  usePlaceFilterWidget: false,
  placeFilters: [],
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
