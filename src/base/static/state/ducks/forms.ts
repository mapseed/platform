import { normalize, denormalize, schema } from "normalizr";
import { createSelector } from "reselect";
import camelcaseKeys from "camelcase-keys";
import isempty from "lodash.isempty";

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

export type FieldOption = {
  order: number;
  label: string;
  value: string | number | boolean;
  icon?: string;
  groupVisibilityTriggers?: number[];
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
  options?: FieldOption[];
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

export interface MapseedRadioFieldModule extends BaseFormModule {
  options: FieldOption[];
}

export interface MapseedCheckboxFieldModule extends BaseFormModule {
  options: FieldOption[];
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
  | MapseedDateFieldModule
  | MapseedCheckboxFieldModule;

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
  type: "place";
};

export type CommentForm = {}; // TODO

export type MapseedForm = PlaceForm;

// Selectors:
const _formsSelector = ({ forms: { entities } }: { forms: NormalizedState }) =>
  entities;

type FormConfigsByDatasetAndType = {
  [datasetUrl: string]: {
    place: {
      type: "place";
      id: string | number;
      datasetSlug: string;
      label: string;
      anonymousName?: string;
      includeOnList?: boolean;
    };
    placeSurvey: {
      type: "placeSurvey";
      surveyType: "comments"; // Could be expanded to other survey types in the future.
      id: string | number;
      datasetSlug: string;
      responseLabel: string;
      responsePluralLabel: string;
      actionText: string;
      anonymousName?: string;
    };
  };
};

const EXPECTED_CONFIG_NAMES = ["place", "placeSurvey"];
export const formConfigsByDatasetAndTypeSelector = createSelector(
  [_formsSelector],
  ({ forms }) => {
    const configsByDatasetUrl: FormConfigsByDatasetAndType = Object.values(
      forms,
    ).reduce(
      (memo, { dataset, type, ...rest }) => ({
        ...memo,
        [dataset]: {
          placeSurvey: {},
          ...memo[dataset],
          [type]: { ...rest },
        },
      }),
      {},
    );

    // Generally we expect that datasets will require supporting configuration
    // for both `place` and `placeSurvey` forms. This isn't a requirement, but
    // we warn about missing configurations.
    Object.entries(configsByDatasetUrl).forEach(([datasetUrl, config]) => {
      EXPECTED_CONFIG_NAMES.forEach(configName => {
        if (isempty(config[configName])) {
          // eslint-disable-next-line no-console
          console.warn(
            `[Forms duck]: WARNING: Supporting configuration for '${configName}' form for dataset with url ${datasetUrl} not found. Configure this in the 'forms' array of the flavor config.`,
          );
        }
      });
    });

    return configsByDatasetUrl;
  },
);

export const placeFormIdSelector = (
  { forms: { entities } }: { forms: NormalizedState },
  datasetUrl: string,
) =>
  (
    Object.values(entities.forms).find(
      ({ type, dataset }) => type === "place" && dataset === datasetUrl,
    ) || {}
  ).id;

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
  } else if (rawFormModule.checkboxfield) {
    return { key: "checkboxfield", variant: "checkboxfield" };
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
// TODO: this isn't just for placeForms?
export const placeFormSelector = createSelector(
  _formsSelector,
  (_, formId) => formId,
  (entities, formId) =>
    denormalize(entities.forms[formId], formsSchema, entities),
);

export const newPlaceFormInitialValuesSelector = createSelector(
  [placeFormSelector],
  ({ stages }) =>
    stages
      .map(({ modules }) => modules)
      .reduce((flat, toFlatten) => flat.concat(toFlatten), [])
      .filter(({ type }) => isFormField(type))
      .reduce(
        (initialValues, { key, defaultValue }) => ({
          ...initialValues,
          [key]: defaultValue || "",
        }),
        {},
      ),
);

export const placeDetailModulesSelectorFactory = () =>
  createSelector(
    placeFormSelector,
    (_, __, locationType) => locationType,
    ({ stages }, locationType = "") => {
      const placeDetailModules = stages
        .map(({ modules }) => modules)
        .reduce((flat, toFlatten) => flat.concat(toFlatten), [])
        .filter(
          ({ type, key }: { type: string; key: string }): boolean =>
            isFormField(type) &&
            !key.startsWith("private-") &&
            !["title", "name", "submitterName"].includes(key),
        );

      // For legacy reasons it's convenient to pull out the value of the form
      // module with key `location_type`, since this value is used in various
      // places, like the PlaceDetailView. We default to the empty string when
      // no `location_type` module exists.
      const locationTypeLabel = (
        (
          (placeDetailModules.find(({ key }) => key === "location_type") || {})
            .options || []
        ).find(({ value }) => value === locationType) || { label: "" }
      ).label;

      return {
        placeDetailModules,
        locationTypeLabel,
      };
    },
  );

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
      // NOTE: Group visibility triggers can only trigger `groupmodule`s, so we
      // prepend the `groupmodule` identifier here.
      moduleIds: moduleIds.map(moduleId => `groupmodule${moduleId}`),
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
          modules: {
            ...state.entities.modules,
            ...action.payload.moduleIds.reduce(
              (memo, moduleId) => ({
                ...memo,
                [moduleId]: {
                  ...state.entities.modules[moduleId],
                  isVisible: action.payload.isVisible,
                },
              }),
              {},
            ),
          },
        },
      };
    default:
      return state;
  }
}
