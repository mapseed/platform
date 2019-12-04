import PropTypes from "prop-types";

// Selectors:
export const placeConfigSelector = ({ placeConfig }) => placeConfig;

export const placeConfigPropType = PropTypes.shape({
  anonymous_name: PropTypes.string.isRequired,
  action_text: PropTypes.string.isRequired,
  list: PropTypes.shape({
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        image_name: PropTypes.string,
        type: PropTypes.string,
      }),
    ),
  }),
  geospatialAnalysis: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      targetUrl: PropTypes.string.isRequired,
      buffer: PropTypes.shape({
        distance: PropTypes.number.isRequired,
        units: PropTypes.string.isRequired,
      }),
      aggregator: {
        type: PropTypes.string.isRequired,
        property: PropTypes.string,
      },
      propertiesToPluck: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          fallbackValue: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.bool,
          ]),
        }),
      ),
    }),
  ),
});

// Actions:
const LOAD = "place-config/LOAD";

// Action creators:
export function loadPlaceConfig(config) {
  return { type: LOAD, payload: config };
}

// Reducers:
// TODO(luke): refactor our current implementation in AppView to use
const INITIAL_STATE = {
  anonymous_name: "",
  action_text: "",
};

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
