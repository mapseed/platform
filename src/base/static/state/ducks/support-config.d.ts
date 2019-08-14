import { User } from "./user";

export type Support = {
  url: string;
  created_datetime: string;
  update_datetime: string;
  dataset: string;
  id: number;
  place: string;
  set: string;
  user_token: string;
  visibile: boolean;
  submitter?: User;
};

export type SupportConfig = {
  submission_type: "support";
  submit_btn_text: string;
  response_name: string;
  response_plural_name: string;
  action_text: string;
  anonymous_name: string;
};

declare type Action = {
  type: string;
  payload: any;
};

export const supportConfigSelector: (state: any) => SupportConfig;

export const loadSupportConfig: (supportConfig: SupportConfig) => Action;
