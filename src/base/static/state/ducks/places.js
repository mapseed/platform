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
  submitter_name: PropTypes.string,
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
const LOAD_PLACES = "places/LOAD";
const UPDATE_PLACES = "places/UPDATE";
const CREATE_PLACE = "places/CREATE";

// Action creators:
export function loadPlaces(places) {
  return { type: LOAD_PLACES, payload: places };
}

export function updatePlaces(places) {
  return { type: UPDATE_PLACES, payload: places };
}

export function createPlace(place) {
  return { type: CREATE_PLACE, payload: place };
}

// Reducers:
const INITIAL_STATE = [];

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD_PLACES:
      return action.payload;
    case UPDATE_PLACES:
      return action.payload.reduce((memo, newPlace) => {
        let oldPlace = memo.find(place => newPlace.id === place.id);
        if (!oldPlace) {
          // TODO: fix the race condition in AppView.viewPlace so this doesn't happen:
          // eslint-disable-next-line no-console
          console.warn(
            "PlaceDuck: Updating a place before it was loaded:",
            newPlace.id,
          );
          oldPlace = {};
        }
        return [
          ...memo,
          {
            // Override data from the old place with data from the new place:
            ...oldPlace,
            ...newPlace,
          },
        ];
      }, state);
    case CREATE_PLACE:
      return [...state, action.payload];
    default:
      return state;
  }
}
