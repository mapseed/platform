import produce from "immer";

// Actions:
const LOAD = "filters/LOAD";

// Action creators:
export function loadFiltersConfig(config) {
  return { type: LOAD, payload: config };
}

// Selectors
export const filtersConfigSelector = state => {
    return state.filters;
};

// Reducers:
const INITIAL_STATE = {
  enable: false,
  components: [],
};

export default (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    switch (action.type) {
      case LOAD:
        return action.payload
    }
  });
