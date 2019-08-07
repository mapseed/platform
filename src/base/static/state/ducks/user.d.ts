export type userPropType = any;
export type UserGroup = {
  dataset: string;
  dataset_slug: string;
  name: string;
  permissions: {
    abilities: string[];
    submission_set: string;
  }[];
};
export type User = {
  id: number;
  name: string;
  provider_type: string;
  username: string;
  avatar_url: string;
  groups: UserGroup[];
  token: string;
  isAuthenticated: boolean;
};

// Selectors:
export const userSelector: (state: any) => User;

export const hasGroupAbilitiesInDatasets: (options: {
  state: any;
  abilities: string[];
  submissionSet: string;
  datasetSlugs: string[];
}) => boolean;

export const hasUserAbilitiesInPlace: (options: {
  state: any;
  submitter: User;
  isSubmitterEditingSupported: boolean;
}) => boolean;

export const hasAdminAbilities: (state: any, datasetSlug: string) => boolean;

export const isInAtLeastOneGroup: (
  state: any,
  groupNames: string[],
  datasetSlug: string,
) => boolean;

// Action creators:
export const loadUser: any;
