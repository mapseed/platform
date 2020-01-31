import { NormalizedState as FormsNormalizedState } from "./ducks/forms";

// TODO: Finish typing the full state object.
type MapseedState = {
  forms: FormsNormalizedState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [reducerName: string]: any;
};

export default MapseedState;
