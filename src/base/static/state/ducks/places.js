import PropTypes from "prop-types";
import { createSelector } from "reselect";
import groupBy from "lodash.groupby";

import { datasetsByUrlSelector } from "./datasets";
import { formConfigsByDatasetAndTypeSelector } from "./forms";

// prop types:
export const placePropType = PropTypes.shape({
  attachments: PropTypes.array.isRequired,
  updated_datetime: PropTypes.string.isRequired,
  created_datetime: PropTypes.string.isRequired,
  dataset: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  submission_sets: PropTypes.object.isRequired,
  id: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  title: PropTypes.string,
  submitter: PropTypes.object,
  __clientSideMetadata: PropTypes.object.isRequired,
});

export const placesPropType = PropTypes.arrayOf(placePropType);

const ensureSubmissionSetsAndMetadata = ({
  place,
  dataset: { clientSlug, slug: datasetSlug },
  formConfigsByType: {
    place: {
      anonymousName: placeAnonymousName = "Someone",
      actionText: placeActionText = "created",
      responseLabel: placeResponseLabel = "post",
      includeOnList = true,
    },
    placeSurvey: {
      id: placeSurveyFormId,
      surveyType,
      anonymousName: placeSurveyAnonymousName = "Someone",
      responseLabel: placeSurveyResponseLabel = "",
      responsePluralLabel: placeSurveyResponsePluralLabel = "",
      actionText: placeSurveyActionText = "",
    } = {},
  },
}) => ({
  ...place,
  submission_sets: {
    ...place.submission_sets,
    support: place.submission_sets.support || [],
    comments: place.submission_sets.comments || [],
  },
  // Data that's useful to attach to the Place model on the client side:
  __clientSideMetadata: {
    clientSlug,
    datasetSlug,
    includeOnList,
    placeAnonymousName,
    placeResponseLabel,
    placeActionText,
    placeSurveyAnonymousName,
    placeSurveyResponseLabel,
    placeSurveyResponsePluralLabel,
    placeSurveyActionText,
    placeSurveyFormId,
  },
});

// Selectors:
export const placesLoadStatusSelector = ({ places: { loadStatus } }) =>
  loadStatus;

const _placesSelector = ({ places: { placeModels } }) => placeModels;

export const placesSelector = createSelector(
  [_placesSelector, datasetsByUrlSelector, formConfigsByDatasetAndTypeSelector],
  (places, datasetsByUrl, formConfigsByDatasetAndType) =>
    places.map(place =>
      ensureSubmissionSetsAndMetadata({
        place,
        dataset: datasetsByUrl[place.dataset],
        formConfigsByType: formConfigsByDatasetAndType[place.dataset],
      }),
    ),
);

export const placeSelectorFactory = () =>
  createSelector(
    placesSelector,
    (_, placeId) => Number(placeId),
    (places, placeId) => places.find(({ id }) => id === placeId),
  );

export const placesBySourceIdSelector = createSelector(
  [placesSelector],
  places =>
    groupBy(
      places,
      ({ __clientSideMetadata: { datasetSlug: sourceId } }) => sourceId,
    ),
);

//export const datasetPlacesSelector = (datasetSlug, state) => {
//  return state.places.placeModels.filter(
//    place => place.datasetSlug === datasetSlug,
//  );
//};

export const filteredPlacesSelector = state => {
  const placeFilters = state.placeFilters;

  if (!state.places.placeModels || placeFilters.length === 0) {
    return state.places.placeModels;
  }

  return state.places.placeModels.filter(place => {
    return placeFilters.some(placeFilter => {
      switch (placeFilter.operator) {
        case "includes":
          return (
            placeFilter.datasetSlug === place.datasetSlug &&
            Array.isArray(place[placeFilter.placeProperty]) &&
            place[placeFilter.placeProperty].includes(placeFilter.value)
          );
        case "equals":
        default:
          return (
            placeFilter.datasetSlug === place.datasetSlug &&
            place[placeFilter.placeProperty] === placeFilter.value
          );
      }
    });
  });
};

export const datasetLengthSelector = (state, datasetSlug) =>
  state.places.placeModels.filter(place => place.datasetSlug === datasetSlug)
    .length;

// Actions:
const LOAD_PLACES = "places/LOAD";
const LOAD_PLACE_AND_SET_IGNORE_FLAG = "places/LOAD_PLACE_AND_SET_IGNORE_FLAG";
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
const UPDATE_ACTIVE_EDIT_PLACE_ID = "places/UPDATE_ACTIVE_EDIT_PLACE_ID";
const UPDATE_FOCUSED_PLACE_ID = "places/UPDATE_FOCUSED_PLACE_ID";
const UPDATE_SCROLL_TO_RESPONSE_ID = "places/UPDATE_SCROLL_TO_RESPONSE_ID";

// Action creators:
export function updateScrollToResponseId(responseId) {
  return {
    type: UPDATE_SCROLL_TO_RESPONSE_ID,
    payload: responseId,
  };
}

export function loadPlaces(places) {
  return {
    type: LOAD_PLACES,
    payload: places,
  };
}

export function loadPlaceAndSetIgnoreFlag(place) {
  return {
    type: LOAD_PLACE_AND_SET_IGNORE_FLAG,
    payload: place,
  };
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

// Reducers:
const INITIAL_STATE = {
  placeModels: [],
  loadStatus: "unloaded",
  ignorePlaceId: null,
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_LOAD_STATUS:
      return {
        ...state,
        loadStatus: action.payload,
      };
    case LOAD_PLACE_AND_SET_IGNORE_FLAG:
      return {
        ...state,
        ignorePlaceId: action.payload.id,
        // In case a page of Place data has arrived after the individual Place
        // request was sent, perform a check here to make sure we don't add a
        // duplicate copy of the Place.
        placeModels: state.placeModels.find(
          place => place.id === action.payload.id,
        )
          ? state.placeModels
          : state.placeModels.concat(action.payload),
      };
    case LOAD_PLACES:
      return {
        ...state,
        placeModels: state.placeModels.concat(
          // Filter out a Place model which matches ignorePlaceId, so a page
          // fetch doesn't add a duplicate of the individually fetched Place.
          action.payload.filter(place => place.id !== state.ignorePlaceId),
        ),
      };
    case UPDATE_PLACE:
      return {
        ...state,
        placeModels: state.placeModels.map(placeModel => {
          if (placeModel.id === action.payload.id) {
            placeModel = action.payload;
          }

          return placeModel;
        }),
      };
    case CREATE_PLACE:
      return {
        ...state,
        placeModels: [...state.placeModels, action.payload],
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
            return {
              ...place,
              submission_sets: {
                ...place.submission_sets,
                support: place.submission_sets.support.concat(
                  action.payload.supportData,
                ),
              },
            };
          }

          return place;
        }),
      };
    case REMOVE_PLACE_SUPPORT:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
          if (place.id === action.payload.placeId) {
            return {
              ...place,
              submission_sets: {
                ...place.submission_sets,
                support: place.submission_sets.support.filter(
                  support => support.id !== action.payload.supportId,
                ),
              },
            };
          }

          return place;
        }),
      };
    case CREATE_PLACE_COMMENT:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
          if (place.id === action.payload.placeId) {
            return {
              ...place,
              submission_sets: {
                ...place.submission_sets,
                comments: place.submission_sets.comments.concat(
                  action.payload.commentData,
                ),
              },
            };
          }

          return place;
        }),
      };
    case REMOVE_PLACE_COMMENT:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
          if (place.id === action.payload.placeId) {
            return {
              ...place,
              submission_sets: {
                ...place.submission_sets,
                comments: place.submission_sets.comments.filter(
                  comment => comment.id !== action.payload.commentId,
                ),
              },
            };
          }

          return place;
        }),
      };
    case UPDATE_PLACE_COMMENT:
      return {
        ...state,
        placeModels: state.placeModels.map(place => {
          if (place.id === action.payload.placeId) {
            return {
              ...place,
              submission_sets: {
                ...place.submission_sets,
                comments: place.submission_sets.comments.map(comment => {
                  if (comment.id === action.payload.commentData.id) {
                    comment = action.payload.commentData;
                  }

                  return comment;
                }),
              },
            };
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
    default:
      return state;
  }
}
