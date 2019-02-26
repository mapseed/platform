import PropTypes from "prop-types";

// Selectors:
export const placesLoadStatusSelector = state => {
  return state.places.loadStatus;
};
export const placesSelector = state => {
  return state.places.placeModels;
};
export const dashboardPlacesSelector = state => {
  if (!state.places.placeModels) {
    return state.places.placeModels;
  }
  return state.places.placeModels.filter(
    place => place.datasetId === state.dashboardConfig.datasetId,
  );
};

export const filteredPlacesSelector = state => {
  const filters = state.filters;
  if (!state.places.placeModels || filters.length === 0) {
    return state.places.placeModels;
  }
  // a formId and a location_type are currenty equivalent
  const filteredFormIds = filters.reduce((memo, filter) => {
    memo.push(filter.formId);
    return memo;
  }, []);
  return state.places.placeModels.filter(place =>
    filteredFormIds.includes(place.location_type),
  );
};

export const datasetLengthSelector = (state, datasetSlug) =>
  state.places.placeModels.filter(place => place._datasetSlug === datasetSlug)
    .length;

export const placeSelector = (state, placeId) => {
  return state.places.placeModels.find(place => place.id === parseInt(placeId));
};

export const placeExists = (state, placeId) => {
  return !!state.places.placeModels.find(place => place.id === placeId);
};

export const activePlaceIdSelector = state => {
  return state.places.activePlaceId;
};

export const placePropType = PropTypes.shape({
  attachments: PropTypes.array.isRequired,
  updated_datetime: PropTypes.string.isRequired,
  created_datetime: PropTypes.string.isRequired,
  dataset: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  _datasetSlug: PropTypes.string.isRequired,
  submitter_name: PropTypes.string,
  submission_sets: PropTypes.object.isRequired,
  id: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  title: PropTypes.string,
  location_type: PropTypes.string.isRequired,
  submitter: PropTypes.object,
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
const UPDATE_PLACE_TAG = "places/UPDATE_PLACE_TAG";
const REMOVE_PLACE_ATTACHMENT = "places/REMOVE_PLACE_ATTACHMENT";
const CREATE_PLACE_ATTACHMENT = "places/CREATE_PLACE_ATTACHMENT";
const UPDATE_LOAD_STATUS = "places/UPDATE_LOAD_STATUS";
const UPDATE_ACTIVE_PLACE_ID = "places/UPDATE_ACTIVE_PLACE_ID";

// Action creators:
export function loadPlaces(places, storyConfig = {}) {
  const storyChapters = Object.values(storyConfig).reduce((flat, toFlatten) => {
    return flat.concat(toFlatten.chapters);
  }, []);

  places = places.map(place => {
    place.submission_sets.support = place.submission_sets.support || [];
    place.submission_sets.comments = place.submission_sets.comments || [];
    place.story =
      storyChapters.find(chapter => chapter.placeId === place.id) || null;

    return place;
  });

  return { type: LOAD_PLACES, payload: places };
}

export function updateActivePlaceId(placeId) {
  return { type: UPDATE_ACTIVE_PLACE_ID, payload: placeId };
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

export function updatePlaceTag(placeId, placeTagData) {
  return { type: UPDATE_PLACE_TAG, payload: { placeId, placeTagData } };
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

export function updatePlacesLoadStatus(loadStatus) {
  return {
    type: UPDATE_LOAD_STATUS,
    payload: loadStatus,
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
const INITIAL_STATE = {
  placeModels: [],
  loadStatus: "unloaded",
  activePlaceId: null,
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_LOAD_STATUS:
      return {
        ...state,
        loadStatus: action.payload,
      };
    case LOAD_PLACES:
      return {
        ...state,
        placeModels: state.placeModels.concat(action.payload),
      };
    case UPDATE_PLACE:
      return {
        ...state,
        placeModels: [
          // Filter out the place model that's being updated.
          ...state.placeModels.filter(
            placeModel => placeModel.id !== action.payload.id,
          ),
          {
            // Add it back in, along with the updated data.
            ...state.placeModels.find(
              placeModel => placeModel.id === action.payload.id,
            ),
            ...normalizeSubmissionSets(action.payload),
          },
        ],
      };
    case CREATE_PLACE:
      return {
        ...state,
        placeModels: [
          ...state.placeModels,
          normalizeSubmissionSets(action.payload),
        ],
      };
    case REMOVE_PLACE:
      return {
        ...state,
        placeModels: state.placeModels.filter(
          place => place.id !== action.payload,
        ),
      };
    case CREATE_PLACE_SUPPORT:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
          if (place.id === action.payload.placeId) {
            place.submission_sets.support = place.submission_sets.support.concat(
              action.payload.supportData,
            );
          }

          return place;
        }),
      };
    case REMOVE_PLACE_SUPPORT:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
          if (place.id === action.payload.placeId) {
            place.submission_sets.support = place.submission_sets.support.filter(
              support => support.id !== action.payload.supportId,
            );
          }

          return place;
        }),
      };
    case CREATE_PLACE_COMMENT:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
          if (place.id === action.payload.placeId) {
            place.submission_sets.comments = place.submission_sets.comments.concat(
              action.payload.commentData,
            );
          }

          return place;
        }),
      };
    case REMOVE_PLACE_COMMENT:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
          if (place.id === action.payload.placeId) {
            place.submission_sets.comments = place.submission_sets.comments.filter(
              comment => comment.id !== action.payload.commentId,
            );
          }

          return place;
        }),
      };
    case UPDATE_PLACE_COMMENT:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
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
        }),
      };
    case CREATE_PLACE_TAG:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
          if (place.id === action.payload.placeId) {
            place.tags = place.tags.concat([action.payload.placeTagData]);
          }

          return place;
        }),
      };
    case REMOVE_PLACE_TAG:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
          if (place.id === action.payload.placeId) {
            place.tags = place.tags.filter(
              tag => tag.id !== action.payload.placeTagId,
            );
          }

          return place;
        }),
      };
    case UPDATE_PLACE_TAG:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
          if (place.id === action.payload.placeId) {
            place.tags = place.tags.map(placeTag => {
              if (placeTag.id === action.payload.placeTagData.id) {
                placeTag = action.payload.placeTagData;
              }

              return placeTag;
            });
          }

          return place;
        }),
      };
    case REMOVE_PLACE_ATTACHMENT:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
          if (place.id === action.payload.placeId) {
            place.attachments = place.attachments.filter(
              attachment => attachment.id !== action.payload.attachmentId,
            );
          }

          return place;
        }),
      };
    case CREATE_PLACE_ATTACHMENT:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
          if (place.id === action.payload.placeId) {
            place.attachments = place.attachments.concat([
              action.payload.attachmentData,
            ]);
          }

          return place;
        }),
      };
    case UPDATE_ACTIVE_PLACE_ID:
      return {
        ...state,
        activePlaceId: action.payload,
      };
    default:
      return state;
  }
}
