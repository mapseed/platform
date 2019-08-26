export type PlaceFilter = {
  placeProperty: string;
  operator: "includes" | "equals";
  datasetSlug: string;
  value: string | number | boolean;
};

export const placeFiltersSelector: (state: any) => PlaceFilter[];

export const updatePlaceFilters: (placeFilters: PlaceFilter[]) => void;
