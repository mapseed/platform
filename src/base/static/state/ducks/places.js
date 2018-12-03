import PropTypes from "prop-types";

// Selectors:
export const placesSelector = state => {
  return state.places;
};

export const placePropType = PropTypes.shape({
  attachments: PropTypes.array.isRequired,
  updated_datetime: PropTypes.string.isRequired,
  created_datetime: PropTypes.string.isRequired,
  dataset: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  datasetSlug: PropTypes.string.isRequired,
  submitter_name: PropTypes.string.isRequired,
  submission_sets: PropTypes.object.isRequired,
  id: PropTypes.number.isRequired,
  datasetId: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  location_type: PropTypes.string.isRequired,
  submitter: PropTypes.object,
  type: PropTypes.string.isRequired,
});

export const placesPropType = PropTypes.arrayOf(placePropType);

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
