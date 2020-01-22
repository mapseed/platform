import PropTypes from "prop-types";
import { createSelector } from "reselect";
import groupBy from "lodash.groupby";

import { datasetsByUrlSelector } from "./datasets";
import { formConfigsByDatasetAndTypeSelector } from "./forms";
import { placeFiltersSelector } from "./place-filters";

// prop types:
export const placePropType = PropTypes.shape({
  attachments: PropTypes.array.isRequired,
  // eslint-disable-next-line @typescript-eslint/camelcase
  updated_datetime: PropTypes.string.isRequired,
  // eslint-disable-next-line @typescript-eslint/camelcase
  created_datetime: PropTypes.string.isRequired,
  dataset: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  // eslint-disable-next-line @typescript-eslint/camelcase
  submission_sets: PropTypes.object.isRequired,
  id: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  title: PropTypes.string,
  submitter: PropTypes.object,
  mapseedConfiguration: PropTypes.object.isRequired,
});

export const placesPropType = PropTypes.arrayOf(placePropType);

const ensureSubmissionSetsAndMetadata = ({
  place,
  dataset: { clientSlug, slug: datasetSlug },
  formConfigsByType: {
    place: {
      id: placeFormId,
      anonymousName: placeAnonymousName = "Someone",
      actionText: placeActionText = "created",
      responseLabel: placeResponseLabel = "post",
      includeOnList = true,
    },
    placeSurvey: {
      id: placeSurveyFormId,
      anonymousName: placeSurveyAnonymousName = "Someone",
      responseLabel: placeSurveyResponseLabel = "",
      responsePluralLabel: placeSurveyResponsePluralLabel = "",
      actionText: placeSurveyActionText = "",
    } = {},
  },
}) => ({
  ...place,
  // eslint-disable-next-line @typescript-eslint/camelcase
  submission_sets: {
    ...place.submission_sets,
    support: place.submission_sets.support || [],
    comments: place.submission_sets.comments || [],
  },
  // Data that's useful to attach to the Place model on the client side:
  mapseedConfiguration: {
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
    placeFormId,
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

export const filteredPlacesSelector = createSelector(
  [placesSelector, placeFiltersSelector],
  (places, placeFilters) => {
    if (placeFilters.length === 0) {
      return places;
    }

    return places.filter(
      ({
        mapseedConfiguration: { datasetSlug: placeDatasetSlug },
        ...place
      }) => {
        return placeFilters.some(
          ({ placeProperty, operator, datasetSlug, value }) => {
            switch (operator) {
              case "includes":
                return (
                  datasetSlug === placeDatasetSlug &&
                  Array.isArray(place[placeProperty]) &&
                  place[placeProperty].includes(value)
                );
              case "equals":
              default:
                return (
                  datasetSlug === placeDatasetSlug &&
                  place[placeProperty] === value
                );
            }
          },
        );
      },
    );
  },
);

export const placesByDatasetUrlSelectorFactory = () =>
  createSelector(
    placesSelector,
    (_, datasetUrl) => datasetUrl,
    (places, datasetUrl) =>
      places.filter(({ dataset }) => dataset === datasetUrl),
  );

export const placeSelector = createSelector(
  placesSelector,
  (_, placeId) => Number(placeId),
  (places, placeId) => places.find(({ id }) => id === placeId),
);

export const placesBySourceIdSelector = createSelector(
  [placesSelector],
  places =>
    groupBy(
      places,
      ({ mapseedConfiguration: { datasetSlug: sourceId } }) => sourceId,
    ),
);

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
              // eslint-disable-next-line @typescript-eslint/camelcase
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
              // eslint-disable-next-line @typescript-eslint/camelcase
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
              // eslint-disable-next-line @typescript-eslint/camelcase
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
              // eslint-disable-next-line @typescript-eslint/camelcase
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
              // eslint-disable-next-line @typescript-eslint/camelcase
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
