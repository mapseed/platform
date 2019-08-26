/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { withTheme } from "emotion-theming";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import Divider from "@material-ui/core/Divider";

import { RegularText } from "../atoms/typography";
import { Image } from "../atoms/imagery";
import {
  updatePlaceFilters,
  placeFiltersSelector,
  PlaceFilter,
} from "../../state/ducks/place-filters";
import {
  placeFiltersConfigSelector,
  PlaceFiltersConfig,
} from "../../state/ducks/flavor-config";
import { NavBarItem } from "../../state/ducks/nav-bar-config";
import mq from "../../../../media-queries";

type StateProps = {
  placeFiltersConfig: PlaceFiltersConfig;
  placeFilters: PlaceFilter[];
};

type DispatchProps = {
  updatePlaceFilters: typeof updatePlaceFilters;
};

type OwnProps = {
  navBarItem: NavBarItem;
};

type PlaceFilterMenuProps = StateProps & DispatchProps & OwnProps;

const FILTER_MENU_ALL = "mapseed-place-filter-menu-all";
const PlaceFilterMenu: React.FunctionComponent<
  PlaceFilterMenuProps
> = props => {
  const handleChange = evt => {
    if (evt.target.value.includes(FILTER_MENU_ALL)) {
      props.updatePlaceFilters([]);
      return;
    }

    props.updatePlaceFilters(
      evt.target.value.map(filterValue => {
        const {
          value,
          placeProperty,
          operator,
          datasetSlug,
        } = props.placeFiltersConfig.find(
          config => config.value === filterValue,
        );

        return {
          value,
          placeProperty,
          operator,
          datasetSlug,
        };
      }),
    );
  };

  return (
    <div
      css={css`
        ${[mq[0]]} {
          text-align: center;
        }
        ${[mq[1]]} {
          padding-left: 12px;
          border-left: ${props.position > 0
            ? "solid 1px " + props.theme.text.tertiary
            : "none"};
        }
      `}
    >
      <FormControl>
        <Select
          multiple
          disableUnderline
          value={props.placeFilters.map(placeFilter => placeFilter.value)}
          onChange={handleChange}
          displayEmpty={true}
          input={<Input id="place-filters" />}
          renderValue={() => (
            <span
              css={css`
                font-family: ${props.theme.text.navBarFontFamily};
                font-size: 0.9rem;
                font-weight: 600;
                text-transform: uppercase;
                color: ${props.theme.brand.primary};
              `}
            >
              {`${props.navBarItem.title}${
                props.placeFilters.length > 0 ? " (on)" : ""
              }`}
            </span>
          )}
        >
          <MenuItem value={FILTER_MENU_ALL}>
            <Checkbox checked={props.placeFilters.length === 0} />
            <ListItemText primary={props.t("filterMenuOptionAll", "All")} />
          </MenuItem>
          <Divider />
          {props.placeFiltersConfig.map(placeFilterConfig => (
            <MenuItem
              key={placeFilterConfig.value}
              value={placeFilterConfig.value}
            >
              <Checkbox
                checked={
                  props.placeFilters.filter(
                    placeFilter =>
                      placeFilter.value === placeFilterConfig.value,
                  ).length > 0
                }
              />
              {placeFilterConfig.icon && (
                <Image
                  css={css`
                    width: 20px;
                    max-width: 20px;
                    min-width: 20px;
                    height: auto;
                    margin-right: 12px;
                  `}
                  src={placeFilterConfig.icon}
                  alt={"Map marker"}
                />
              )}
              <ListItemText primary={placeFilterConfig.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

const mapStateToProps = (state): StateProps => ({
  placeFiltersConfig: placeFiltersConfigSelector(state),
  placeFilters: placeFiltersSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updatePlaceFilters: placeFilters =>
    dispatch(updatePlaceFilters(placeFilters)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTheme(withTranslation("PlaceFilterMenu")(PlaceFilterMenu)));
