/* eslint-disable @typescript-eslint/no-explicit-any */
export const featuredPlacesPropType: any;
export const featuredPlacesConfigPropType: any;

export type FeaturedPlace = {
  placeId: number;
  zoom?: number;
  hasCustomZoom?: boolean;
  panTo?: number[];
  visibleLayerGroupIds?: string[];
  previous?: string;
  next?: string;
  iconUrl?: string;
  spotlight?: boolean;
  sidebarIconUrl?: string;
};

export type FeaturedPlacesConfig = {
  name?: string;
  header?: string;
  visibleLayerGroupIds: string;
  description?: string;
  places: FeaturedPlace[];
};

// Selectors:
export const featuredPlacesConfigSelector: any;

export const featuredPlacesSelector: any;

// Action creators:
export const loadFeaturedPlacesConfig: any;
