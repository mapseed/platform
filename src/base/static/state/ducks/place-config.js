import PropTypes from "prop-types";

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
      if (!field.restrict_to_groups) {
        // If a form field is not restricted to any groups, assume it should be
        // visible to all users.
        field.isVisible = true;
      } else {
        // Otherwise, determine if the field should be shown for the current
        // user. If the user groups array and the field admin_groups array share
        // a common element, this field shoud be visible for the current user.
        field.isVisible = user.groups
          .filter(group => group.dataset_slug === category.dataset_slug)
          .some(group => field.restrict_to_groups.includes(group.name));
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
