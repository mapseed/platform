// Selectors:
export const datasetSlugsSelector: (state: any) => string[];
export const datasetsConfigSelector: (state: any) => DatasetConfig[];
export const datasetClientSlugSelector: (
  state: any,
  datasetSlug: string,
) => string;
export const datasetReportSelector: (
  state: any,
  datasetSlug: string,
) => DatasetReport;

export const datasetsConfigPropType: any;

type DatasetReport = {
  templateName: string;
  filename: string;
};

export type Ability = "create" | "retrieve" | "update" | "destroy";
export type SubmissionSet = "comments" | "support" | "places";

type PlaceConfirmationModal = {
  [submissionType: string]: {
    header?: string;
    body: string[];
  };
};

export type DatasetConfig = {
  url: string;
  slug: string;
  clientSlug: string;
  anonymous_permissions: {
    abilities: Ability[];
    submission_set: string;
  }[];
  report?: DatasetReport;
  placeConfirmationModal?: PlaceConfirmationModal;
};

export const datasetPlaceConfirmationModalSelector: (
  state: any,
  datasetSlug?: string,
) => PlaceConfirmationModal;

export const hasAnonAbilitiesInAnyDataset: ({
  state,
  abilities,
  submissionSet,
}: {
  state: any;
  abilities: Ability[];
  submissionSet: SubmissionSet;
}) => boolean;

export const hasAnonAbilitiesInDataset: ({
  state,
  abilities,
  submissionSet,
  datasetSlug,
}: {
  state: any;
  abilities: Ability[];
  submissionSet: SubmissionSet;
  datasetSlug: string;
}) => boolean;

// Action creators:
declare type Action = {
  type: string;
  payload: any;
};
export const loadDatasetsConfig: (datasetsConfig: DatasetConfig[]) => Action;
