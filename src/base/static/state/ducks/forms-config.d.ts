type PlaceFormConfig = {
  id: string;
  datasetSlug: string;
  label: string;
  icon?: string;
};

export type PlaceFormsConfig = PlaceFormConfig[];

export type CommentFormConfigItem = {
  prompt?: string;
  type: string;
  name: string;
};

export type CommentFormConfig = {
  items: CommentFormConfigItem[];
  response_name: string;
  response_plural_name: string;
};

type FormFieldContent = {
  label: string;
  value: string | number | boolean;
};

export type FormFieldConfig = {
  id: string;
  autocomplete?: boolean;
  type: string;
  propmt: string;
  display_prompt: string;
  label: string;
  optional: boolean;
  content: FormFieldContent[];
};

export type FormFieldsConfig = FormFieldConfig[];

export type FormsConfig = (
  | PlaceFormsConfig
  | CommentFormConfig
  | FormFieldConfig)[];

export const commentFormConfigSelector: (state: any) => CommentFormConfig;

export const placeFormsConfigSelector: (state: any) => PlaceFormsConfig;

export const formFieldsConfigSelector: (state: any) => FormFieldsConfig;

export const loadFormsConfig: (formsConfig: FormsConfig) => void;
