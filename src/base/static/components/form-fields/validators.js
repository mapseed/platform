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
const mustHaveUniqueUrl = (url, places) => {
  if (url === "") {
    // If no custom URL has been provided, we assume we'll fall back to the
    // slug/id URL form, and thus we don't need to worry about validation.
    return true;
  }
  let isValid = true;
  for (let collection in places) {
    if (places[collection].findWhere({ "url-title": url })) {
      isValid = false;
    }
  }

  return isValid;
};

export { mayHaveAnyValue, mustHaveSomeValue, mustHaveUniqueUrl };
