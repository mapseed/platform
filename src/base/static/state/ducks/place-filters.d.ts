export type PlaceFilterOperator = "includes" | "equals";

export type PlaceFilter = {
  placeProperty: string;
  operator: PlaceFilterOperator;
  datasetSlug: string;
  value: string | number | boolean;
};

export const placeFiltersSelector: (state: any) => PlaceFilter[];

export const updatePlaceFilters: (placeFilters: PlaceFilter[]) => void;
