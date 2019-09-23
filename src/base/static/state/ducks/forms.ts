import { normalize, schema } from "normalizr";
import { createSelector } from "reselect";

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
const moduleSelector = (state, moduleId) =>
  state.forms.entities.modules[moduleId];

const stageSelector = (state, stageId) => state.forms.entities.stages[stageId];

export const placeFormSelector = state => {
  // TODO: Eventually the comment form may be sent along with the Place form.
  // For now, we assume there is a single form in the `forms` array and that
  // form is the Place form.
  const placeFormId = state.forms.entities.flavor[state.forms.result].forms[0];
  const placeForm = state.forms.entities.form[placeFormId];

  return {
    ...placeForm,
    stages: placeForm.stages.map(stageId => {
      const stage = stageSelector(state, stageId);

      return {
        ...stage,
        modules: stage.modules.map(moduleId => moduleSelector(state, moduleId)),
      };
    }),
  };
};

// Actions:
const LOAD = "forms/LOAD";

// Action creators:
const formModuleSchema = new schema.Entity("modules");
const formStageSchema = new schema.Entity("stages", {
  modules: [formModuleSchema],
});
const formSchema = new schema.Entity("form", {
  stages: [formStageSchema],
});
const flavorSchema = new schema.Entity("flavor", {
  forms: [formSchema],
});

export function loadForms(flavor) {
  return {
    type: LOAD,
    payload: normalize(flavor, flavorSchema),
  };
}

// Reducers:
const INITIAL_STATE = {};

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
