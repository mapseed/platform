// Prop Types:
export const tagPropType: any;

export type Tag = {
  id: number;
  name: string;
  parent?: number;
  url: string;
  displayName: string[];
  isEnabled: boolean;
  color?: string;
  children: number[];
};

export const placeTagPropType: any;

export type PlaceTag = {
  id: number;
  note?: string;
  tag: string;
  url: string;
};

export const datasetsPropType: any;

// The Dataset as it comes back from our api:
export type DatasetFromAPI = {
  url: string;
  owner: string;
  places: {
    length: number;
    url: string;
  };
  tags: Tag[];
  submission_sets: object; // TODO
  display_name: string;
  auth_required: boolean;
  slug: string;
};

// our internal Dataset representation.
// TODO: update serialization in apiClient, and refactor snake case to
// camelCase.
export type Dataset = {
  url: string;
  owner: string;
  places: {
    length: number;
    url: string;
  };
  tags: Tag[];
  submission_sets: object; // TODO
  display_name: string;
  auth_required: boolean;
  clientSlug: string;
  slug: string;
};

// Selectors:
export const datasetsSelector: (state: any) => Dataset[];

export const datasetUrlSelector: (state: any, datasetSlug: string) => string;

// Action creators:
declare type Action = {
  type: string;
  payload: any;
};
export const loadDatasets: (datasets: Dataset[]) => Action;

export const getTagFromUrl: ({
  state,
  datasetSlug,
  tagUrl,
}: {
  state: any;
  datasetSlug: string;
  tagUrl: string;
}) => Tag;

export const getAllTagsForDataset: (state: any, datasetSlug: string) => Tag[];

export const getColorForTag: ({
  state,
  datasetSlug,
  tagUrl,
}: {
  state: any;
  datasetSlug: string;
  tagUrl: string;
}) => string;
