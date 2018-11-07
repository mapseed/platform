// Selectors:
export const placesSelector = state => {
  return state.places;
};

// Actions:
const SET_PLACES = "places/SET";
const CREATE_PLACE = "places/CREATE";

// Action creators:
export function setPlaces(places) {
  return { type: SET_PLACES, payload: places };
}

export function createPlace(place) {
  return { type: CREATE_PLACE, payload: place };
}

// Reducers:
const INITIAL_STATE = [];

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_PLACES:
      return action.payload;
    case CREATE_PLACE:
      return [...state, action.payload];
    default:
      return state;
  }
}
