/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import PropTypes from "prop-types";
import moment from "moment";
import "moment-timezone";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import groupBy from "lodash.groupby";

import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { placesSelector, placesPropType } from "../../state/ducks/places";
import {
  datasetsConfigPropType,
  datasetsConfigSelector,
} from "../../state/ducks/datasets-config";
import {
  dashboardConfigSelector,
  dashboardConfigPropType,
} from "../../state/ducks/dashboard-config";
import {
  appConfigSelector,
  appConfigPropType,
} from "../../state/ducks/app-config";
import {
  placeFormsConfigSelector,
  placeFormsConfigPropType,
  formFieldsConfigSelector,
  formFieldsConfigPropType,
} from "../../state/ducks/forms-config";
import { hasAdminAbilities } from "../../state/ducks/user";
import { HorizontalRule } from "../atoms/layout";
import {
  ExternalLink,
  RegularTitle,
  SmallTitle,
  LargeLabel,
  ExtraLargeLabel,
} from "../atoms/typography";
import PieChart from "../molecules/pie-chart";
import BarChart from "../molecules/bar-chart";

import makeParsedExpression from "../../utils/expression/parse";

const MAX_DASHBOARD_WIDTH = "1120px";

// These are the colors we use for our charts:
const BLUE = "#5DA5DA";
const COLORS = [
  "#4D4D4D",
  "#B2912F",
  "#FAA43A",
  "#60BD68",
  "#F17CB0",
  BLUE,
  "#B276B2",
  "#DECF3F",
  "#F15854",
];

const DashboardWrapper = styled("div")({
  display: "grid",
  gridTemplateRows: "auto",
  gridTemplateColumns: "auto",
  maxWidth: MAX_DASHBOARD_WIDTH,
  margin: "8px auto 24px auto",
  height: "100%",
  overflow: "auto",

  "&::-webkit-scrollbar": {
    display: "none",
  },
});

class Dashboard extends React.Component {
  state = {
    dashboard: this.props.dashboardConfig[0],
  };

  componentDidMount() {
  }

  render() {
    return (
      <DashboardWrapper>
        <SmallTitle>{this.state.dashboard.header}</SmallTitle>
        <HorizontalRule
          css={{
            marginTop: 0,
          }}
        />
        O HAI IM UR DASHBOARD
      </DashboardWrapper>
    );
  }
}

Dashboard.propTypes = {
  dashboardConfig: dashboardConfigPropType.isRequired,
  appConfig: appConfigPropType.isRequired,
  apiRoot: PropTypes.string,
  hasAdminAbilities: PropTypes.func.isRequired,
  allPlaces: placesPropType,
  placeFormsConfig: placeFormsConfigPropType.isRequired,
  formFieldsConfig: formFieldsConfigPropType,
  datasetsConfig: datasetsConfigPropType,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  hasAdminAbilities: datasetSlug => hasAdminAbilities(state, datasetSlug),
  allPlaces: placesSelector(state),
  dashboardConfig: dashboardConfigSelector(state),
  placeFormsConfig: placeFormsConfigSelector(state),
  formFieldsConfig: formFieldsConfigSelector(state),
  datasetsConfig: datasetsConfigSelector(state),
});

export default withRouter(connect(mapStateToProps)(Dashboard));
