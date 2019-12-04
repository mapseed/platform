import { Dataset } from "./datasets";

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

export const datasetsWithCreatePlacesAbilitySelector: (state: any) => Dataset[];

export const datasetsWithAccessProtectedPlacesAbilitySelector: (
  state: any,
) => Dataset[];

export const datasetsWithEditTagsAbilitySelector: (state: any) => Dataset[];

export const datasetsWithUpdatePlacesAbilitySelector: (state: any) => Dataset[];

export const hasUserAbilitiesInPlace: (options: {
  state: any;
  submitter: User;
  isSubmitterEditingSupported: boolean;
}) => boolean;

export const hasAdminAbilitiesSelector: (
  state: any,
  datasetSlug: string,
) => boolean;

// Action creators:
export const loadUser: any;
