import { MapViewport } from "./map";

interface FormField {
  key: string;
  private: boolean;
  required: boolean;
  prompt?: string;
  placeholder?: string;
  label?: string;
  //variant: string // ??
  //validate?: boolean // ??
}

// Types:
type HTMLModule = {
  content: string;
  label?: string;
};

type SubmitButtonModule = {
  label: string;
};

// TODO: other module types
type FormModuleTypes = {
  htmlmodule: HTMLModule;
  textfield: FormField;
  filefield: FormField;
  latlngfield: FormField; // TODO: Should be lnglatfield instead
  submitbuttonmodule: SubmitButtonModule;
};

type FormModuleNames = keyof FormModuleTypes;

interface FormModuleType<T> {
  [T: FormModuleNames]: FormModuleTypes[T];
}

export type FormModule = {
  id: number;
  order: number;
  visible: boolean;
  [FormModuleNames]: FormModuleType<string>;
};

export type PlaceFormStage = {
  visible_layer_groups: { label: string }[];
  map_viewport: MapViewport;
  modules: FormModule[];
};

export type PlaceForm = {
  label: string;
  is_enabled: boolean;
  dataset: string;
  stages: PlaceFormStage[];
};

export type CommentForm = {}; // TODO

export type Form = PlaceForm | CommentForm;

// Selectors:
export const placeFormSelector = state => state.forms.place;

// Actions:
const LOAD = "forms/LOAD";

// Action creators:
export function loadForms(forms) {
  // TODO: Eventually the comment form may be sent along with the Place form.
  // For now, we assume there is a single form in the `forms` array and that
  // form is the Place form.
  return { type: LOAD, payload: { place: forms[0] || {} } };
}

// Reducers:
const INITIAL_STATE = {
  place: {},
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
