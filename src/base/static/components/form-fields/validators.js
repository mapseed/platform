import { List } from "immutable";

const isWithAnyValue = () => true;

const isNotEmpty = ({ value }) => {
  if (value instanceof List) {
    return !(value.size === 0);
  } else {
    return !!value;
  }

  // TODO: Accommodate other Immutable types here as needed.
};

export { isWithAnyValue, isNotEmpty };
