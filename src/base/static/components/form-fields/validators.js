import { List as ImmutableList } from "immutable";

import constants from "../constants";

const mayHaveAnyValue = () => true;
const mustHaveSomeValue = value => {
  if (value instanceof ImmutableList) {
    return !(value.size === 0);
  } else {
    return !!value;
  }

  // TODO: Accommodate other Immutable types here as needed.
};
const mustHaveUniqueUrl = (url, places, modelId) => {
  let isValid = true;
  if (url === "") {
    // If no custom URL has been provided, we assume we'll fall back to the
    // slug/id URL form, and thus we don't need to worry about validation.
    return isValid;
  }
  for (let collection in places) {
    if (
      places.hasOwnProperty(collection) &&
      places[collection]
        .filter(model => model.get(constants.CUSTOM_URL_PROPERTY_NAME) === url)
        // We filter the current model out of this check to prevent validating a
        // model's custom URL against itself. We'll have a current model if
        // we're editing an existing place.
        .filter(
          model => model.get(constants.MODEL_ID_PROPERTY_NAME) !== modelId
        ).length > 0
    ) {
      isValid = false;
    }
  }

  return isValid;
};

export { mayHaveAnyValue, mustHaveSomeValue, mustHaveUniqueUrl };
