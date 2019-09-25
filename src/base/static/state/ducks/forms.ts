import { normalize, schema } from "normalizr";
import { createSelector } from "reselect";
import camelcaseKeys from "camelcase-keys";

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
const formModulesSelector = state => state.forms.entities.modules;
const formStagesSelector = state => state.forms.entities.stages;
const placeFormIdSelector = state =>
  // TODO: Eventually the comment form may be sent along with the Place form.
  // For now, we assume there is a single form in the `forms` array and that
  // form is the Place form.
  state.forms.entities.flavor[state.forms.result].forms[0];
const flattenedPlaceFormSelector = state =>
  state.forms.entities.form[placeFormIdSelector(state)];

export const placeFormSelector = createSelector(
  [formStagesSelector, formModulesSelector, flattenedPlaceFormSelector],
  (formStages, formModules, placeForm) => {
    return {
      ...placeForm,
      stages: placeForm.stages.map(stageId => {
        const stage = formStages[stageId];

        return {
          ...stage,
          modules: stage.modules.map(moduleId => formModules[moduleId]),
        };
      }),
    };
  },
);

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
    payload: camelcaseKeys(normalize(flavor, flavorSchema), { deep: true }),
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
