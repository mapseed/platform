// Selectors:
export const placesSelector = state => {
  return state.places;
};

// Actions:
const SET_PLACES = "places/SET";

// Action creators:
export function setPlaces(places) {
  return { type: SET_PLACES, payload: places };
}

// Reducers:
const INITIAL_STATE = [];

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_PLACES:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
