import PropTypes from "prop-types";

import { userSelector } from "./user";

// Selectors:
export const placeConfigSelector = state => {
  return state.placeConfig;
};

export const placeConfigPropType = PropTypes.shape({
  anonymous_name: PropTypes.string.isRequired,
  action_text: PropTypes.string.isRequired,
  place_detail: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  list: PropTypes.shape({
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        image_name: PropTypes.string,
        type: PropTypes.string,
      }),
    ),
  }),
});

// Actions:
const LOAD = "place-config/LOAD";

// Action creators:
export function setPlaceConfig(config, user) {
  config.place_detail = config.place_detail.map(category => {
    category.fields = category.fields.map(field => {
      if (!field.admin_groups) {
        // If a form field declares no admin group, assume it should be visible
        // to all users.
        field.isVisible = true;
      } else {
        // Otherwise, determine if the field should be shown for the current
        // user.
        const groups = user.groups.filter(group => {
          // Filter out groups that are not part of the dataset that this
          // category belongs to.
          const [datasetId] = group.dataset.split("/").slice(-1);
          return datasetId === category.dataset;
        });

        // If the user groups array and the field admin_groups array share a
        // common element, this field shoud be visible for the current user.
        field.isVisible = user.groups.some(group =>
          field.admin_groups.includes(group.name),
        );
      }

      return field;
    });

    return category;
  });

  return { type: LOAD, payload: config };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = null;

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
