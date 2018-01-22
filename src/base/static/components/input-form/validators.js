import { List as ImmutableList } from "immutable";

const mayHaveAnyValue = () => true;
const mustHaveSomeValue = value => {
  if (value instanceof ImmutableList) {
    return !(value.size === 0);
  } else {
    return !!value;
  }

  // TODO: Accommodate other Immutable types here as needed.
};

export { mayHaveAnyValue, mustHaveSomeValue };
