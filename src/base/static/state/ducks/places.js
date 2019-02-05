import PropTypes from "prop-types";

// Selectors:
export const placesSelector = state => {
  return state.places;
};
export const dashboardPlacesSelector = state => {
  if (!state.places) {
    return state.places;
  }
  return state.places.filter(
    place => place.datasetId === state.dashboardConfig.datasetId,
  );
};

export const filteredPlacesSelector = state => {
  const filters = state.filters;
  if (!state.places || filters.length === 0) {
    return state.places;
  }
  // a formId and a location_type are currenty equivalent
  const filteredFormIds = filters.reduce((memo, filter) => {
    memo.push(filter.formId);
    return memo;
  }, []);
  return state.places.filter(place =>
    filteredFormIds.includes(place.location_type),
  );
};

export const datasetLengthSelector = (state, datasetSlug) =>
  state.places.filter(place => place._datasetSlug === datasetSlug).length;

export const placeSelector = (state, placeId) => {
  return state.places.find(place => place.id === placeId);
};

export const placeExists = (state, placeId) => {
  return !!state.places.find(place => place.id === placeId);
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
  title: PropTypes.string,
  location_type: PropTypes.string.isRequired,
  submitter: PropTypes.object,
  type: PropTypes.string.isRequired,
});

export const placesPropType = PropTypes.arrayOf(placePropType);

// Actions:
const LOAD_PLACES = "places/LOAD";
const UPDATE_PLACE = "places/UPDATE";
const CREATE_PLACE = "places/CREATE";
const REMOVE_PLACE = "places/REMOVE";
const CREATE_PLACE_SUPPORT = "places/CREATE_PLACE_SUPPORT";
const REMOVE_PLACE_SUPPORT = "places/REMOVE_PLACE_SUPPORT";
const CREATE_PLACE_COMMENT = "places/CREATE_PLACE_COMMENT";
const REMOVE_PLACE_COMMENT = "places/REMOVE_PLACE_COMMENT";

// Action creators:
export function loadPlaces(places) {
  places = places.map(place => {
    place.submission_sets.support = place.submission_sets.support || [];
    place.submission_sets.comments = place.submission_sets.comments || [];

    return place;
  });

  return { type: LOAD_PLACES, payload: places };
}

export function updatePlace(place) {
  return { type: UPDATE_PLACE, payload: place };
}

export function createPlace(place) {
  return { type: CREATE_PLACE, payload: place };
}

export function removePlace(placeId) {
  return { type: REMOVE_PLACE, payload: placeId };
}

export function createPlaceSupport(placeId, supportData) {
  return {
    type: CREATE_PLACE_SUPPORT,
    payload: {
      placeId,
      supportData,
    },
  };
}

export function removePlaceSupport(placeId, supportId) {
  return { type: REMOVE_PLACE_SUPPORT, payload: { placeId, supportId } };
}

export function createPlaceComment(placeId, commentData) {
  return {
    type: CREATE_PLACE_COMMENT,
    payload: {
      placeId,
      commentData,
    },
  };
}

export function removePlaceComment(placeId, commentId) {
  return { type: REMOVE_PLACE_SUPPORT, payload: { placeId, commentId } };
}

// Reducers:
const INITIAL_STATE = [];

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD_PLACES:
      return state.concat(action.payload);
    case UPDATE_PLACE:
      return state.map(place => {
        if (place.id === action.payload.id) {
          place = {
            ...place,
            ...action.payload,
          };
          place.submission_sets.support = place.submission_sets.support || [];
          place.submission_sets.comments = place.submission_sets.comments || [];
        }

        return place;
      });
    case CREATE_PLACE:
      return [...state, action.payload];
    case REMOVE_PLACE:
      return state.filter(place => place.id !== action.payload);
    case CREATE_PLACE_SUPPORT:
      return state.map(place => {
        if (place.id === action.payload.placeId) {
          place.submission_sets.support = (
            place.submission_sets.support || []
          ).concat(action.payload.supportData);
        }

        return place;
      });
    case REMOVE_PLACE_SUPPORT:
      return state.map(place => {
        if (place.id === action.payload.placeId) {
          place.submission_sets.support = place.submission_sets.support.filter(
            support => support.id !== action.payload.supportId,
          );
        }

        return place;
      });
    case CREATE_PLACE_COMMENT:
      return state.map(place => {
        if (place.id === action.payload.placeId) {
          place.submission_sets.comments = (
            place.submission_sets.comments || []
          ).concat(action.payload.commentData);
        }

        return place;
      });
    case REMOVE_PLACE_COMMENT:
      return state.map(place => {
        if (place.id === action.payload.placeId) {
          place.submission_sets.comments = place.submission_sets.comments.filter(
            comment => comment.id !== action.payload.commentId,
          );
        }

        return place;
      });
    default:
      return state;
  }
}
