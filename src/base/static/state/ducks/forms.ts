import { normalize, schema } from "normalizr";
import { createSelector } from "reselect";
import camelcaseKeys from "camelcase-keys";
import { FieldProps as FormikFieldProps } from "formik";

import { MapViewport } from "./map";

// Types:
// NOTE: Typings reflect loaded, transformed data.
type FormModuleVariant = "EM" | "PH";

interface BaseFormModule {
  id: number;
  key: string;
  isVisible: boolean;
  isPrivate?: boolean;
  isRequired?: boolean;
  type: string;
  defaultValue?: string | number | string[] | number[];
  variant?: FormModuleVariant;
  prompt?: string;
}

export interface MapseedHTMLModule extends BaseFormModule {
  content: string;
  label: string;
}

export interface MapseedSubmitButtonModule extends BaseFormModule {
  label: string;
}

export interface MapseedFileFieldModule extends BaseFormModule {
  label: string;
}

export interface MapseedTextFieldModule extends BaseFormModule {
  placeholder: string;
}

export interface MapseedSkipStageModule extends BaseFormModule {
  label: string;
  stageId: number;
}

export type FormModule =
  | MapseedHTMLModule
  | MapseedSubmitButtonModule
  | MapseedFileFieldModule
  | MapseedTextFieldModule
  | MapseedSkipStageModule;

export type PlaceFormStage = {
  visibleLayerGroups: string[];
  mapViewport: MapViewport;
  modules: FormModule[];
};

export type PlaceForm = {
  label: string;
  isEnabled: boolean;
  dataset: string;
  stages: PlaceFormStage[];
};

export type CommentForm = {}; // TODO

export type MapseedForm = PlaceForm | CommentForm;

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

const getModuleType = rawFormModule => {
  if (rawFormModule.htmlmodule) {
    return "htmlmodule";
  } else if (rawFormModule.textfield) {
    return "textfield";
  } else if (rawFormModule.submitbuttonmodule) {
    return "submitbuttonmodule";
  } else if (rawFormModule.filefield) {
    return "filefield";
  } else if (rawFormModule.skipstagemodule) {
    return "skipstagemodule";
  } else {
    // eslint-disable-next-line no-console
    console.error(
      `[Forms duck]: ERROR: encountered unknown raw form module with id ${rawFormModule.id}`,
    );

    return "unknownmodule";
  }
};

const formModuleProcessStrategy = (rawFormModule): FormModule => {
  // Flatten module configs keyed by module name:
  const { visible: isVisible, id } = rawFormModule;
  const moduleType = getModuleType(rawFormModule);
  const { private: isPrivate, required: isRequired, ...rest } = rawFormModule[
    moduleType
  ];

  return {
    // Certain modules do not have a `key`, but our forms' business logic
    // expects each module to have this property. Those that do will have this
    // generic key overwritten by the `rest` properties below.
    key: `module-${id}`,
    type: moduleType,
    id,
    isVisible: !!isVisible,
    isPrivate: !!isPrivate,
    isRequired: !!isRequired,
    ...rest,
  };
};

// Action creators:
const formModuleSchema = new schema.Entity(
  "modules",
  {},
  {
    processStrategy: formModuleProcessStrategy,
  },
);
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
