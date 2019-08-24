type PlaceFormConfig = {
  id: string;
  datasetSlug: string;
  label: string;
  icon?: string;
}

export type PlaceFormsConfig = {
  places: PlaceFormConfig[]; 
}
