/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import { useSelector, useDispatch } from "react-redux";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Divider from "@material-ui/core/Divider";

import MapWidgetWrapper from "./map-widget-wrapper";
import {
  placeFiltersConfigSelector,
  PlaceFiltersConfig,
} from "../../state/ducks/flavor-config";
import {
  updatePlaceFilters,
  PlaceFilter,
} from "../../state/ducks/place-filters";

const isWithoutFilters = state =>
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
  const placeFiltersConfig: PlaceFiltersConfig = useSelector(
    placeFiltersConfigSelector,
  );
  const dispatch = useDispatch();
  const [state, setState] = React.useState(resetFilters(placeFiltersConfig));

  React.useEffect(() => {
    if (isWithoutFilters(state)) {
      dispatch(updatePlaceFilters([]));
      return;
    }

    const activeFilters = Object.entries(state)
      // eslint-disable-next-line
      .filter(([_, isActive]) => isActive)
      // eslint-disable-next-line
      .map(([filterValue, _]) => {
        const placeFilterConfig = placeFiltersConfig.find(
          config => config.value === filterValue,
        );

        if (placeFilterConfig) {
          return {
            value: placeFilterConfig.value,
            placeProperty: placeFilterConfig.placeProperty,
            operator: placeFilterConfig.operator,
            datasetSlug: placeFilterConfig.datasetSlug,
          };
        }
      });

    dispatch(updatePlaceFilters(activeFilters));
  }, [state, placeFiltersConfig, dispatch]);

  const handleChange = evt => {
    const { value, checked } = evt.target;

    if (value === FILTER_MENU_ALL) {
      dispatch(updatePlaceFilters([]));
      setState({
        ...resetFilters(placeFiltersConfig),
      });

      return;
    }

    setState({
      ...state,
      [value]: checked,
    });
  };

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
            {placeFiltersConfig.map(placeFilterConfig => (
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
