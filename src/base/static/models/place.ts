export type PlaceTag = {
  id: number;
  note?: string;
  tag: string;
  url: string;
};

interface SubmittedThing {
  url: string;
  id: number;
  attachments: any;
  dataset: string;
  submitter?: any; // UserFromApi
  place: string;
  set: string;
  created_datetime: string;
  updated_datetime: string;
  visible: boolean;
  user_token: string;
}

export type Support = SubmittedThing;

export interface Comment extends SubmittedThing {
  comment: string;
}
