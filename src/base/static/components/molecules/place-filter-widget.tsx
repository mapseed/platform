/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Divider from "@material-ui/core/Divider";
import { withTranslation, WithTranslation } from "react-i18next";
import { Image } from "../atoms/imagery";

import MapWidgetWrapper from "./map-widget-wrapper";
import {
  PlaceFiltersConfig,
  visiblePlaceFiltersConfigSelector,
} from "../../state/ducks/flavor-config";
import {
  updatePlaceFilters,
  PlaceFilter,
  PlaceFilterOperator,
} from "../../state/ducks/place-filters";
import { RegularText } from "../atoms/typography";

const UNFILTERED_VALUE = "__MAPSEED_UNFILTERED__";
const isWithoutFilters = state =>
  // Determine if the user has un-selected all filters.
  !Object.values(state).some(filterOptionState => filterOptionState);

const PlaceFilterWidget = (props: WithTranslation) => {
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
    visiblePlaceFiltersConfig.reduce(
      (memo, { value, setDefault = false }) => ({
        ...memo,
        [value]: setDefault,
      }),
      {},
    ),
  );

  React.useEffect(() => {
    if (isWithoutFilters(state)) {
      setState({
        ...state,
        [UNFILTERED_VALUE]: true,
      });

      return;
    }

    const activeFilters = Object.entries(state)
      // eslint-disable-next-line
      .filter(([_, isActive]) => isActive)
      // eslint-disable-next-line
      .reduce((memo: PlaceFilter[], [filterValue, _]) => {
        const placeFilterConfig =
          filterValue === UNFILTERED_VALUE
            ? // When no filters are applied, pass an empty filter that will
              // cause all Places to be filtered out.
              {
                operator: "equals" as PlaceFilterOperator,
                datasetSlug: "",
                placeProperty: "",
                value: "",
              }
            : visiblePlaceFiltersConfig.find(
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

    setState({
      ...state,
      [value]: checked,
      [UNFILTERED_VALUE]: false,
    });
  };

  if (visiblePlaceFiltersConfig.length === 0) {
    return null;
  }

  return (
    <MapWidgetWrapper color="black">
      {() => (
        <React.Fragment>
          <RegularText
            weight="bold"
            css={css`
              display: flex;
              margin-bottom: 8px;
            `}
          >
            {props.t("placeFilterWidgetShowLabel", "Show:")}
          </RegularText>
          <Divider />
          <FormControl component="fieldset">
            <FormGroup>
              {visiblePlaceFiltersConfig.map(placeFilterConfig => (
                <div
                  key={placeFilterConfig.value}
                  css={css`
                    display: flex;
                    align-items: center;
                  `}
                >
                  <FormControlLabel
                    style={{
                      marginRight: "8px",
                    }}
                    control={
                      <Checkbox
                        style={{
                          padding: "2px 8px 2px 8px",
                        }}
                        checked={state[placeFilterConfig.value]}
                        onChange={handleChange}
                        value={placeFilterConfig.value}
                      />
                    }
                    label={placeFilterConfig.label}
                  ></FormControlLabel>
                  {placeFilterConfig.icon && (
                    <Image
                      css={css`
                        width: 20px;
                        max-width: 20px;
                      `}
                      src={placeFilterConfig.icon}
                      alt="Map icon"
                    />
                  )}
                </div>
              ))}
            </FormGroup>
          </FormControl>
        </React.Fragment>
      )}
    </MapWidgetWrapper>
  );
};

export default withTranslation("PlaceFilterWidget")(PlaceFilterWidget);
