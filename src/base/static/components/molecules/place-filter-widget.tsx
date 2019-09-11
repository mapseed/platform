/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Divider from "@material-ui/core/Divider";

import MapWidgetWrapper from "./map-widget-wrapper";
import {
  PlaceFiltersConfig,
  visiblePlaceFiltersConfigSelector,
} from "../../state/ducks/flavor-config";
import {
  updatePlaceFilters,
  PlaceFilter,
} from "../../state/ducks/place-filters";

const isWithoutFilters = state =>
  // Determine if the user has un-selected all filters.
  !Object.values(state).some(filterOptionState => filterOptionState);

const resetFilters = placeFiltersConfig =>
  placeFiltersConfig.reduce(
    (memo, { value }) => ({
      ...memo,
      [value]: false,
    }),
    {},
  );

const FILTER_MENU_ALL = "mapseed-place-filter-menu-widget-all";
const PlaceFilterWidget = () => {
  // Because `visiblePlaceFiltersConfig` is a dep of a `useEffect` hook below,
  // use `shallowEqual` comparison to prevent a referential equality comparison
  // between renders, mimicking the behavior of `connect()`. Using referential
  // equality here throws the component into an infinite render loop.
  // See: https://react-redux.js.org/next/api/hooks#equality-comparisons-and-updates
  const visiblePlaceFiltersConfig: PlaceFiltersConfig = useSelector(
    visiblePlaceFiltersConfigSelector,
    shallowEqual,
  );
  const dispatch = useDispatch();
  const [state, setState] = React.useState(
    resetFilters(visiblePlaceFiltersConfig),
  );

  React.useEffect(() => {
    if (isWithoutFilters(state)) {
      dispatch(updatePlaceFilters([]));
      return;
    }

    const activeFilters = Object.entries(state)
      // eslint-disable-next-line
      .filter(([_, isActive]) => isActive)
      // eslint-disable-next-line
      .reduce((memo: PlaceFilter[], [filterValue, _]) => {
        const placeFilterConfig = visiblePlaceFiltersConfig.find(
          config => config.value === filterValue,
        );

        return placeFilterConfig
          ? [
              ...memo,
              {
                value: placeFilterConfig.value,
                placeProperty: placeFilterConfig.placeProperty,
                operator: placeFilterConfig.operator,
                datasetSlug: placeFilterConfig.datasetSlug,
              },
            ]
          : [...memo];
      }, []);

    dispatch(updatePlaceFilters(activeFilters));
  }, [state, visiblePlaceFiltersConfig, dispatch]);

  const handleChange = evt => {
    const { value, checked } = evt.target;

    if (value === FILTER_MENU_ALL) {
      dispatch(updatePlaceFilters([]));
      setState({
        ...resetFilters(visiblePlaceFiltersConfig),
      });

      return;
    }

    setState({
      ...state,
      [value]: checked,
    });
  };

  if (visiblePlaceFiltersConfig.length === 0) {
    return null;
  }

  return (
    <MapWidgetWrapper color="black">
      {() => (
        <FormControl component="fieldset">
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isWithoutFilters(state)}
                  onChange={handleChange}
                  value={FILTER_MENU_ALL}
                />
              }
              label="All"
            />
            <Divider />
            {visiblePlaceFiltersConfig.map(placeFilterConfig => (
              <FormControlLabel
                key={placeFilterConfig.value}
                control={
                  <Checkbox
                    checked={state[placeFilterConfig.value]}
                    onChange={handleChange}
                    value={placeFilterConfig.value}
                  />
                }
                label={placeFilterConfig.label}
              />
            ))}
          </FormGroup>
        </FormControl>
      )}
    </MapWidgetWrapper>
  );
};

export default PlaceFilterWidget;
