/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
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
import { RegularTitle } from "../atoms/typography";
import {
  FreeDonutChart,
  getFreeDonutChartData,
} from "../organisms/dashboard/free-donut-chart";
import {
  FreeBarChart,
  getFreeBarChartData,
} from "../organisms/dashboard/free-bar-chart";
import {
  MapseedLineChart,
  getLineChartData,
} from "../organisms/dashboard/line-chart";
import {
  StatSummary,
  getStatSummaryData,
} from "../organisms/dashboard/stat-summary";

import constants from "../../constants";
import makeParsedExpression from "../../utils/expression/parse";

const widgetRegistry = {
  lineChart: {
    component: MapseedLineChart,
    getData: getLineChartData,
  },
  freeDonutChart: {
    component: FreeDonutChart,
    getData: getFreeDonutChartData,
  },
  freeBarChart: {
    component: FreeBarChart,
    getData: getFreeBarChartData,
  },
  statSummary: {
    component: StatSummary,
    getData: getStatSummaryData,
  },
};

class Dashboard extends React.Component {
  state = {
    dashboard: this.props.dashboardConfig[0],
    dataset: this.props.allPlaces.filter(
      place => place.datasetSlug === this.props.dashboardConfig[0].datasetSlug,
    ),
  };

  componentDidUpdate(prevProps) {
    if (this.props.allPlaces.length !== prevProps.allPlaces.length) {
      this.setState({
        dataset: this.props.allPlaces,
      });
    }
  }

  render() {
    return (
      <div
        css={css`
          overflow: auto;
          width: 100%;
          height: calc(100% - ${constants.HEADER_HEIGHT}px);
          background-color: #ece6e6;

          &::-webkit-scrollbar {
            width: 0;
          }
        `}
      >
        <div
          css={css`
            width: 95%;
            margin-left: auto;
            margin-right: auto;
            margin-top: 48px;
          `}
        >
          <RegularTitle>{this.state.dashboard.header}</RegularTitle>
          <HorizontalRule spacing="tiny" />
        </div>
        <div
          css={css`
            display: grid;
            grid-template-columns: repeat(12, 1fr); // 12-column grid
            grid-gap: 8px;
            grid-auto-rows: auto;
            margin: 24px auto 24px auto;
            width: 95%;
            box-sizing: border-box;
          `}
        >
          {this.state.dashboard.widgets.map(widget => {
            const WidgetComponent = widgetRegistry[widget.type].component;

            return (
              <WidgetComponent
                {...widget}
                data={widgetRegistry[widget.type].getData({
                  widget,
                  timeZone: this.props.appConfig.time_zone,
                  dataset: this.state.dataset,
                })}
              />
            );
          })}
        </div>
      </div>
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
