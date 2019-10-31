import { normalize, schema } from "normalizr";
import { createSelector } from "reselect";
import camelcaseKeys from "camelcase-keys";
import { FieldProps as FormikFieldProps } from "formik";

import { MapViewport } from "./map";
import { isFormField } from "../../utils/place-utils";

// Types:
// NOTE: Typings reflect loaded, transformed data.
type Flavor = {
  id: number;
  displayName: string;
  forms: MapseedForm[];
};

type FormModuleVariant = "EM" | "PH";

type AttachmentType = "CO" | "RT";

export type MapseedAttachment = {
  canvas: HTMLCanvasElement; // Used only for client-side previews.
  name: string;
  type: AttachmentType;
  file: string;
  blob: Blob;
  uploadedDatetime: number;
};

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
  modules?: FormModule[];
  label?: string;
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

export interface MapseedAddressFieldModule extends BaseFormModule {
  reverseGeocode: boolean;
  placeholder?: string;
}

export interface MapseedSkipStageModule extends BaseFormModule {
  label: string;
  stageId: number;
}

export type RadioFieldOption = {
  order: number;
  label: string;
  value: string | number | boolean;
  icon?: string;
  groupVisibilityTriggers?: number[];
};

export interface MapseedRadioFieldModule extends BaseFormModule {
  options: RadioFieldOption[];
}

export interface MapseedNumberFieldModule extends BaseFormModule {
  maximum?: number;
  minimum?: number;
  placeholder?: string;
  units?: string;
}

export interface MapseedDateFieldModule extends BaseFormModule {
  formFormat: string;
  labelFormat: string;
  placeholder?: string;
  includeOngoing: boolean;
  ongoingLabel?: string;
}

export type FormModule =
  | MapseedHTMLModule
  | MapseedSubmitButtonModule
  | MapseedFileFieldModule
  | MapseedTextFieldModule
  | MapseedAddressFieldModule
  | MapseedSkipStageModule
  | MapseedRadioFieldModule
  | MapseedNumberFieldModule
  | MapseedDateFieldModule;

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

export type MapseedForm = PlaceForm;

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

export const placeFormInitialValuesSelector = createSelector(
  [formModulesSelector],
  formModules => {
    return (Object.values(formModules) as FormModule[])
      .filter(({ type }) => isFormField(type))
      .reduce((initialValues, { key, defaultValue }) => {
        return {
          ...initialValues,
          // TODO: other initial value use cases:
          //   - load from form state dump
          //   - editor
          [key]: defaultValue || "",
        };
      }, {});
  },
);

// TODO: Break this into a few separate selectors:
//  - a "stage field" selector, which selects stage field configurations
//  - a "group module" selector, which selects nested modules within groupmodules
export const placeFormSelector = createSelector(
  [formStagesSelector, formModulesSelector, flattenedPlaceFormSelector],
  (formStages, formModules, placeForm) => {
    return {
      ...placeForm,
      stages: placeForm.stages.map(stageId => {
        const stage = formStages[stageId];

        return {
          ...stage,
          modules: stage.modules.map(moduleId => {
            const formModule = formModules[moduleId];

            return formModule.type === "groupmodule"
              ? {
                  ...formModule,
                  modules: formModule.modules.map(
                    subFormModuleId => formModules[subFormModuleId],
                  ),
                }
              : formModule;
          }),
        };
      }),
    };
  },
);

// TODO: handle multiple datasets
export const placeDetailViewModulesSelector = state =>
  (Object.values(state.forms.entities.modules) as FormModule[]).filter(
    ({ type, key }: { type: string; key: string }): boolean =>
      isFormField(type) &&
      !key.startsWith("private-") && // Private fields are never shown on detail views, even to admins.
      !["title", "name", "submitterName"].includes(key),
  );

// Actions:
const LOAD = "forms/LOAD";
const UPDATE_MODULE_VISIBILITIES = "forms/UPDATE_MODULE_VISIBILITIES";

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
  } else if (rawFormModule.addressfield) {
    return "addressfield";
  } else if (rawFormModule.radiofield) {
    return "radiofield";
  } else if (rawFormModule.numberfield) {
    return "numberfield";
  } else if (rawFormModule.datefield) {
    return "datefield";
  } else if (rawFormModule.textareafield) {
    return "textareafield";
  } else if (rawFormModule.groupmodule) {
    return "groupmodule";
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
  { processStrategy: formModuleProcessStrategy },
);
const formModulesSchema = new schema.Array(formModuleSchema);

// Use a recursive schema definition here to accommodate `groupmodules`, which
// define their own modules in turn.
formModuleSchema.define({ modules: formModulesSchema });
const formStageSchema = new schema.Entity("stages", {
  modules: formModulesSchema,
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

export function updateFormModuleVisibilities(
  moduleIds: number[],
  isVisible: boolean,
) {
  return {
    type: UPDATE_MODULE_VISIBILITIES,
    payload: {
      moduleIds,
      isVisible,
    },
  };
}

interface NormalizedData<T> {
  [uuid: string]: T;
}

interface NormalizedState {
  result: number | null;
  entities: {
    flavor: NormalizedData<Flavor>;
    form: NormalizedData<MapseedForm>;
    stages: NormalizedData<PlaceFormStage>;
    modules: NormalizedData<FormModule>;
  };
}

// Reducers:
const INITIAL_STATE = {
  result: null,
  entities: {
    modules: {},
    stages: {},
    form: {},
    flavor: {},
  },
} as NormalizedState;

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        ...action.payload,
      };
    case UPDATE_MODULE_VISIBILITIES:
      return {
        ...state,
        entities: {
          ...state.entities,
          modules: (Object.values(
            state.entities.modules,
          ) as FormModule[]).reduce((memo, val: FormModule) => {
            return {
              ...memo,
              [val.id]: action.payload.moduleIds.includes(val.id)
                ? ({
                    ...val,
                    isVisible: action.payload.isVisible,
                  } as FormModule)
                : val,
            };
          }, {}),
        },
      };
    default:
      return state;
  }
}
