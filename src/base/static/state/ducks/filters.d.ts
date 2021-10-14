export type FilterComponentOption = {
  title: string;
  layerGroupId: string;
};

export type FilterComponent = {
  title: string;
  options: Array<FilterComponentOption>;
};

export type FiltersConfig = {
  enabled: boolean;
  components: Array<FilterComponent>;
};
export const loadFiltersConfig: (filtersConfig: FiltersConfig) => void;
export const filtersConfigSelector: any;