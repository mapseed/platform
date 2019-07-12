export const placesPropType: any;
export const placePropType: any;

export type Place = {
  attachments: any[];
  updated_datetime: string;
  created_datetime: string;
  dataset: string;
  visible: boolean;
  datasetSlug: string;
  submitter_name?: string;
  submission_sets: any;
  id: number;
  url: string;
  title: string;
  clientSlug: string;
  location_type: string;
  submitter?: any;
};

export const placesLoadStatusSelector: any;
export const placesSelector: any;

export const filteredPlacesSelector: any;

export const datasetLengthSelector: any;

export const placeSelector: any;

export const focusedPlaceSelector: any;

export const placeExists: any;

export const activeEditPlaceIdSelector: any;

export const scrollToResponseIdSelector: any;

// Action creators:
export const updateScrollToResponseId: any;

export const updateFocusedPlaceId: any;

export const loadPlaces: any;

export const loadPlaceAndSetIgnoreFlag: any;

export const updateActiveEditPlaceId: any;

export const updatePlace: any;

export const createPlace: any;

export const removePlace: any;

export const createPlaceSupport: any;

export const removePlaceSupport: any;

export const createPlaceComment: any;

export const removePlaceComment: any;

export const updatePlaceComment: any;
export const createPlaceTag: any;

export const removePlaceTag: any;

export const updatePlaceTag: any;

export const removePlaceAttachment: any;

export const createPlaceAttachment: any;

export const updatePlacesLoadStatus: any;
