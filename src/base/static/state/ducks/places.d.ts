// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/geojson/index.d.ts
import { Point, LineString, Polygon } from "geojson";
import { PlaceTag, Support, Comment } from "../../models/place";

type MapseedGeometry = Point | LineString | Polygon;

/* eslint-disable @typescript-eslint/no-explicit-any */
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
  submission_sets: {
    support: Support[];
    comments: Comment[];
  };
  id: number;
  url: string;
  title: string;
  clientSlug: string;
  location_type: string;
  submitter?: any;
  geometry: MapseedGeometry;
  tags: PlaceTag[];
  // TODO: Deprecate this, if possible:
  story: any;
};

export const placesLoadStatusSelector: any;
export const placesSelector: any;

export const filteredPlacesSelector: any;

export const datasetLengthSelector: any;

export const placeSelector: any;

export const focusedPlaceSelector: (state: any) => Place;

export const placeExists: any;

export const activeEditPlaceIdSelector: any;

export const scrollToResponseIdSelector: (state: any) => number;

export const datasetPlacesSelector: any;

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
