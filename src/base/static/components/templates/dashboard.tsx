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

import { Button } from "../atoms/buttons";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { datasetPlacesSelector } from "../../state/ducks/places";
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
import { Badge } from "../atoms/layout";
import { RegularTitle, SmallText } from "../atoms/typography";
import { FontAwesomeIcon } from "../atoms/imagery";
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
import {
  FixedTable,
  getFixedTableData,
} from "../organisms/dashboard/fixed-table";

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
  fixedTable: {
    component: FixedTable,
    getData: getFixedTableData,
  },
};

class Dashboard extends React.Component {
  state = {
    anchorEl: null,
    dashboard: this.props.dashboardConfig[0],
  };

  toggleDashboardDropdown = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  closeDashboardDropdown = () => {
    this.setState({ anchorEl: null });
  };

  selectAndCloseDashboardDropdown = newDashboardConfig => {
    this.setState({
      anchorEl: null,
      dashboard: newDashboardConfig,
      datasetSlug: this.props.dashboardConfig[0].datasetSlug,
    });
  };

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
            display: flex;
            align-items: center;
          `}
        >
          <div
            css={css`
              display: flex;
              width: 100%;
              justify-content: space-between;
              border-bottom: 1px solid #ccc;
            `}
          >
            <RegularTitle>{this.state.dashboard.header}</RegularTitle>
            <div
              css={css`
                display: flex;
                align-items: center;
              `}
            >
              {this.props.dashboardConfig.length > 0 && (
                <div>
                  <Button
                    variant="badge"
                    color="#cd8888"
                    onClick={this.toggleDashboardDropdown}
                  >
                    <SmallText
                      weight="black"
                      css={css`
                        color: white;
                        margin-right: 8px;
                      `}
                    >
                      View Another Dataset
                    </SmallText>
                    <FontAwesomeIcon
                      fontSize="0.7rem"
                      color="#fff"
                      faClassname="fa fa-chevron-down"
                    />
                  </Button>
                  <Menu
                    id="simple-menu"
                    anchorEl={this.state.anchorEl}
                    open={Boolean(this.state.anchorEl)}
                    onClose={this.closeDashboardDropdown}
                  >
                    {this.props.dashboardConfig.map(dashboardConfig => {
                      const dataset = this.props.datasetsConfig.find(
                        config => config.slug === dashboardConfig.datasetSlug,
                      );
                      return (
                        <MenuItem
                          selected={
                            dashboardConfig.datasetSlug ===
                            this.state.dashboard.datasetSlug
                          }
                          key={dashboardConfig.datasetSlug}
                          onClick={() => {
                            this.selectAndCloseDashboardDropdown(
                              dashboardConfig,
                            );
                          }}
                        >{`${dataset.clientSlug}s`}</MenuItem>
                      );
                    })}
                  </Menu>
                </div>
              )}
              {this.state.dashboard.isExportable && (
                <Button
                  css={css`
                    margin-left: 8px;
                  `}
                  variant="badge"
                  color="#cd8888"
                >
                  <SmallText
                    weight="black"
                    css={css`
                      color: white;
                      margin-right: 8px;
                    `}
                  >
                    Export raw CSV data
                  </SmallText>
                  <FontAwesomeIcon
                    fontSize="0.7rem"
                    color="#fff"
                    faClassname="fa fa-chevron-right"
                  />
                </Button>
              )}
            </div>
          </div>
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
          {this.state.dashboard.widgets.map((widget, i) => {
            const WidgetComponent = widgetRegistry[widget.type].component;

            return (
              <WidgetComponent
                key={i}
                {...widget}
                data={widgetRegistry[widget.type].getData({
                  widget,
                  timeZone: this.props.appConfig.time_zone,
                  places: this.props.datasetPlacesSelector(
                    this.state.dashboard.datasetSlug,
                  ),
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
  datasetPlacesSelector: PropTypes.func.isRequired,
  placeFormsConfig: placeFormsConfigPropType.isRequired,
  formFieldsConfig: formFieldsConfigPropType,
  datasetsConfig: datasetsConfigPropType,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  hasAdminAbilities: datasetSlug => hasAdminAbilities(state, datasetSlug),
  datasetPlacesSelector: datasetSlug =>
    datasetPlacesSelector(datasetSlug, state),
  dashboardConfig: dashboardConfigSelector(state),
  placeFormsConfig: placeFormsConfigSelector(state),
  formFieldsConfig: formFieldsConfigSelector(state),
  datasetsConfig: datasetsConfigSelector(state),
});

export default withRouter(connect(mapStateToProps)(Dashboard));
