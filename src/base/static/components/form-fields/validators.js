import { List } from "immutable";

import constants from "../../constants";

const isWithAnyValue = () => true;

const isNotEmpty = ({ value }) => {
  if (value instanceof List) {
    return !(value.size === 0);
  } else {
    return !!value;
  }

  // TODO: Accommodate other Immutable types here as needed.
};

// This validator ensures that a custom URL entered by the user is not
// duplicated in any other model in any collection on the page. Note that there
// is *not* equivalent server-side validation for custom URLs.
// TODO: Rework custom URLs so that a unique, server-supplied number is part of
// the URL.
const isWithUniqueUrl = ({ value, places, modelId }) => {
  // If the passed URL is an empty string, we assume we'll fall back on the
  // slug/id URL format, so we'll always return true in that case. Otherwise,
  // we make sure not to validate a model's custom URL against itself.
  return (
    value === "" ||
    !Object.values(places).find(placeCollection =>
      placeCollection.find(
        model =>
          model.get(constants.CUSTOM_URL_PROPERTY_NAME) === value &&
          model.get(constants.MODEL_ID_PROPERTY_NAME) !== modelId
      )
    )
  );
};

export { isWithAnyValue, isNotEmpty, isWithUniqueUrl };
