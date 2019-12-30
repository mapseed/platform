import { normalize, denormalize, schema } from "normalizr";
import { createSelector } from "reselect";
import camelcaseKeys from "camelcase-keys";

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

export interface MapseedTextareaFieldModule extends BaseFormModule {
  placeholder: string;
}

export interface MapseedRichTextareaFieldModule extends BaseFormModule {
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
  | MapseedTextareaFieldModule
  | MapseedRichTextareaFieldModule
  | MapseedAddressFieldModule
  | MapseedSkipStageModule
  | MapseedRadioFieldModule
  | MapseedNumberFieldModule
  | MapseedDateFieldModule;

export type PlaceFormStage = {
  visibleLayerGroups: string[];
  mapViewport: MapViewport;
  modules: FormModule[];
  validateGeometry: boolean;
};

export type PlaceForm = {
  id: number;
  label: string;
  isEnabled: boolean;
  engagementText?: string;
  image?: string;
  dataset: string;
  stages: PlaceFormStage[];
};

export type CommentForm = {}; // TODO

export type MapseedForm = PlaceForm;

// Selectors:
const formModulesSelector = state => state.forms.entities.modules;
const formStagesSelector = state => state.forms.entities.stages;
const flattenedFormSelector = (state, formId) => {
  return state.forms.entities.form[formId];
};

export const formFieldsSelector = createSelector(
  [formModulesSelector],
  formModules => {
    return (Object.values(formModules) as FormModule[]).filter(({ type }) =>
      isFormField(type),
    );
  },
);

export const newPlaceFormInitialValuesSelector = createSelector(
  [formFieldsSelector],
  formFields => {
    return formFields.reduce((initialValues, { key, defaultValue }) => {
      return {
        ...initialValues,
        [key]: defaultValue || "",
      };
    }, {});
  },
);

const _formsSelector = ({ forms: { entities } }) => entities.forms;

export const formConfigsByDatasetAndTypeSelector = createSelector(
  [_formsSelector],
  forms =>
    Object.values(forms).reduce(
      (memo, { dataset, type, ...rest }) => ({
        ...memo,
        [dataset]: {
          ...memo[dataset],
          [type]: { ...rest },
        },
      }),
      {},
    ),
);

export const placeFormIdSelector = ({ forms: { entities } }, datasetUrl) =>
  (
    Object.values(entities.forms).find(
      ({ type, dataset }) => type === "place" && dataset === datasetUrl,
    ) || {}
  ).id;

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
    return { key: "htmlmodule", variant: "htmlmodule" };
  } else if (rawFormModule.textfield) {
    return { key: "textfield", variant: "textfield" };
  } else if (rawFormModule.submitbuttonmodule) {
    return { key: "submitbuttonmodule", variant: "submitbuttonmodule" };
  } else if (rawFormModule.filefield) {
    return { key: "filefield", variant: "filefield" };
  } else if (rawFormModule.skipstagemodule) {
    return { key: "skipstagemodule", variant: "skipstagemodule" };
  } else if (rawFormModule.addressfield) {
    return { key: "addressfield", variant: "addressfield" };
  } else if (rawFormModule.radiofield) {
    return { key: "radiofield", variant: "radiofield" };
  } else if (rawFormModule.numberfield) {
    return { key: "numberfield", variant: "numberfield" };
  } else if (rawFormModule.datefield) {
    return { key: "datefield", variant: "datefield" };
  } else if (
    rawFormModule.textareafield &&
    !rawFormModule.textareafield.rich_text
  ) {
    return { key: "textareafield", variant: "textareafield" };
  } else if (
    rawFormModule.textareafield &&
    rawFormModule.textareafield.rich_text
  ) {
    return { key: "textareafield", variant: "richtextareafield" };
  } else if (rawFormModule.groupmodule) {
    return { key: "groupmodule", variant: "groupmodule" };
  } else {
    // eslint-disable-next-line no-console
    console.error(
      `[Forms duck]: ERROR: encountered unknown raw form module with id ${rawFormModule.id}`,
    );

    return { key: "unknownmodule", variant: "unknownmodule" };
  }
};

const formModuleProcessStrategy = (rawFormModule): FormModule => {
  // Flatten module configs keyed by module name:
  const { visible: isVisible, id } = rawFormModule;
  const { key, variant } = getModuleType(rawFormModule);
  const { private: isPrivate, required: isRequired, ...rest } = rawFormModule[
    key
  ];

  return {
    // Certain modules do not have a `key`, but our forms' business logic
    // expects each module to have this property. Those that do will have this
    // generic key overwritten by the `rest` properties below.
    key: `module-${id}`,
    type: variant,
    id,
    isVisible: Boolean(isVisible),
    isPrivate: Boolean(isPrivate),
    isRequired: Boolean(isRequired),
    ...rest,
  };
};

// Action creators:
interface NormalizedData<T> {
  [uuid: string]: T;
}

type Entities = {
  forms: NormalizedData<MapseedForm>;
  stages: NormalizedData<PlaceFormStage>;
  modules: NormalizedData<FormModule>;
};

interface NormalizedState {
  result: (number | string)[];
  entities: Entities;
}

const formModuleSchema = new schema.Entity(
  "modules",
  {},
  {
    processStrategy: formModuleProcessStrategy,
    idAttribute: ({ id }, { type }) =>
      // Supplied module and group submodule `id`s may overlap, so we need to
      // distinguish between them. Note that `type` here is the parent entity's
      // type.
      type === "groupmodule" ? `groupmodule${id}` : id,
  },
);
const formModulesSchema = new schema.Array(formModuleSchema);

// Use a recursive schema definition here to accommodate `groupmodules`, which
// define their own modules in turn.
formModuleSchema.define({ modules: formModulesSchema });
const formStageSchema = new schema.Entity("stages", {
  modules: formModulesSchema,
});
const formsSchema = new schema.Entity("forms", {
  stages: [formStageSchema],
});
const formsDuckSchema = new schema.Array(formsSchema);

// TODO: Break this into a few separate selectors, maybe:
//  - a "stage field" selector, which selects stage field configurations
//  - a "group module" selector, which selects nested modules within groupmodules
// TODO: does this handle groupmodules correctly?
// TODO: memoize this?
export const placeFormSelector = ({ forms: { entities } }, formId) =>
  denormalize(entities.forms[formId], formsSchema, entities);

export function loadForms({ apiForms, configForms, datasets }) {
  // Preprocess forms in order to merge API-based forms info with config-based
  // forms info. It would be nice to perform this work within Normalizr itself,
  // but there doesn't seem to be a way to do this.
  const placeSurveyForms = configForms
    .filter(({ type }) => type === "placeSurvey")
    .map(form => ({
      ...form,
      dataset: (datasets.find(({ slug }) => slug === form.datasetSlug) || {})
        .url,
    }));
  const mergedForms = apiForms
    .map(apiForm => {
      // This *should* be a safe way to obtain the slug for each form's dataset.
      const derivedDatasetSlug = apiForm.dataset.split("/").pop();

      return {
        ...apiForm,
        ...(configForms.find(
          ({ datasetSlug }) => datasetSlug === derivedDatasetSlug,
        ) || {}),
      };
    })
    .concat(placeSurveyForms);

  return {
    type: LOAD,
    payload: normalize(
      camelcaseKeys(mergedForms, { deep: true }),
      formsDuckSchema,
    ),
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

// Reducers:
const INITIAL_STATE = {
  result: [],
  entities: {
    modules: {},
    stages: {},
    forms: {},
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
