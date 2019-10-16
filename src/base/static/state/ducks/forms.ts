import { normalize, schema } from "normalizr";
import { createSelector } from "reselect";
import camelcaseKeys from "camelcase-keys";
import { FieldProps as FormikFieldProps } from "formik";

import { MapViewport } from "./map";

// Types:
interface BaseFormField {
  key: string;
  private: boolean;
  required: boolean;
  prompt?: string;
  placeholder?: string;
  label?: string;
  //variant: string // ??
  //validate?: boolean // ??
}

interface BaseFormModule {
  id: number;
  order: number;
  visible: boolean;
  config: any;
  type: string;
}

interface HTMLModule extends BaseFormModule {
  htmlmodule: {
    content: string;
    label?: string;
  };
}

interface SubmitButtonModule extends BaseFormModule {
  submitbuttonmodule: {
    label: string;
  };
}

interface FileField extends BaseFormModule {
  filefield: BaseFormField;
}

interface TextField extends BaseFormModule {
  textfield: BaseFormField;
}

export type FormModule =
  | HTMLModule
  | SubmitButtonModule
  | FileField
  | TextField;

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

export type Form = PlaceForm | CommentForm;

export type MapseedFormFieldProps = {
  label?: string;
  private: boolean;
  required: boolean;
  placeholder?: string;
  moduleId: number;
};

export type FormFieldProps = MapseedFormFieldProps & FormikFieldProps;

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

const getModuleType = formModule => {
  if (formModule.htmlmodule) {
    return "htmlmodule";
  } else if (formModule.textfield) {
    return "textfield";
  } else if (formModule.submitbuttonmodule) {
    return "submitbuttonmodule";
  } else if (formModule.filefield) {
    return "filefield";
  } else {
    // eslint-disable-next-line no-console
    console.error(
      `[Forms duck]: ERROR: encountered unknown form module with id ${formModule.id}`,
    );

    return "unknownmodule";
  }
};

const formModuleProcessStrategy = formModule => {
  // Normalize module configs keyed by module name to the following format:
  // {
  //   id: 123,
  //   type: "textfield"
  //   config: {
  //     prompt: "xyz",
  //     ...etc
  //   }
  // }
  const moduleType = getModuleType(formModule);

  return {
    type: moduleType,
    config: formModule[moduleType],
    id: formModule.id,
    visible: formModule.visible,
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
