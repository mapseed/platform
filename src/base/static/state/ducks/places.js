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
const UPDATE_PLACE_COMMENT = "places/UPDATE_PLACE_COMMENT";
const CREATE_PLACE_TAG = "places/CREATE_PLACE_TAG";
const REMOVE_PLACE_TAG = "places/REMOVE_PLACE_TAG";
const UPDATE_PLACE_TAG_NOTE = "places/UPDATE_PLACE_TAG_NOTE";
const REMOVE_PLACE_ATTACHMENT = "places/REMOVE_PLACE_ATTACHMENT";
const CREATE_PLACE_ATTACHMENT = "places/CREATE_PLACE_ATTACHMENT";

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
  return { type: REMOVE_PLACE_COMMENT, payload: { placeId, commentId } };
}

export function updatePlaceComment(placeId, commentData) {
  return { type: UPDATE_PLACE_COMMENT, payload: { placeId, commentData } };
}

export function createPlaceTag(placeId, placeTagData) {
  return { type: CREATE_PLACE_TAG, payload: { placeId, placeTagData } };
}

export function removePlaceTag(placeId, placeTagId) {
  return { type: REMOVE_PLACE_TAG, payload: { placeId, placeTagId } };
}

export function removePlaceAttachment(placeId, attachmentId) {
  return { type: REMOVE_PLACE_ATTACHMENT, payload: { placeId, attachmentId } };
}

export function createPlaceAttachment(placeId, attachmentData) {
  return {
    type: CREATE_PLACE_ATTACHMENT,
    payload: { placeId, attachmentData },
  };
}

const normalizeSubmissionSets = place => {
  // A place with no comments or supports will arrive from the API without any
  // information about these submission sets. Because we assume that comments
  // and supports are a part of every Mapseed instance, make sure we at least
  // have an empty array for comments and supports on every place.
  place.submission_sets.support = place.submission_sets.support || [];
  place.submission_sets.comments = place.submission_sets.comments || [];

  return place;
};

// Reducers:
const INITIAL_STATE = [];

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD_PLACES:
      return state.concat(action.payload);
    case UPDATE_PLACE:
      return state.map(place => {
        if (place.id === action.payload.id) {
          action.payload = normalizeSubmissionSets(action.payload);
          place = {
            ...place,
            ...action.payload,
          };
        }

        return place;
      });
    case CREATE_PLACE:
      action.payload = normalizeSubmissionSets(action.payload);
      return [...state, action.payload];
    case REMOVE_PLACE:
      return state.filter(place => place.id !== action.payload);
    case CREATE_PLACE_SUPPORT:
      return state.map(place => {
        if (place.id === action.payload.placeId) {
          place.submission_sets.support = place.submission_sets.support.concat(
            action.payload.supportData,
          );
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
          place.submission_sets.comments = place.submission_sets.comments.concat(
            action.payload.commentData,
          );
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
    case UPDATE_PLACE_COMMENT:
      return state.map(place => {
        if (place.id === action.payload.placeId) {
          place.submission_sets.comments = place.submission_sets.comments.map(
            comment => {
              if (comment.id === action.payload.commentData.id) {
                comment = action.payload.commentData;
              }

              return comment;
            },
          );
        }

        return place;
      });
    case CREATE_PLACE_TAG:
      return state.map(place => {
        if (place.id === action.payload.placeId) {
          place.tags = place.tags.concat([action.payload.placeTagData]);
        }

        return place;
      });
    case REMOVE_PLACE_TAG:
      return state.map(place => {
        if (place.id === action.payload.placeId) {
          place.tags = place.tags.filter(
            tag => tag.id !== action.payload.placeTagId,
          );
        }

        return place;
      });
    case REMOVE_PLACE_ATTACHMENT:
      return state.map(place => {
        if (place.id === action.payload.placeId) {
          place.attachments = place.attachments.filter(
            attachment => attachment.id !== action.payload.attachmentId,
          );
        }

        return place;
      });
    case CREATE_PLACE_ATTACHMENT:
      return state.map(place => {
        if (place.id === action.payload.placeId) {
          place.attachments = place.attachments.concat([
            action.payload.attachmentData,
          ]);
        }

        return place;
      });
    default:
      return state;
  }
}
