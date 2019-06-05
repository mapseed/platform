/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import PropTypes from "prop-types";
import moment from "moment";
import "moment-timezone";
import { withRouter } from "react-router-dom";

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
import { updateCurrentTemplate } from "../../state/ducks/ui";
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
import { connect } from "react-redux";
import styled from "@emotion/styled";

import groupBy from "lodash.groupby";
import {
  LineChart,
  Line,
  Label,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

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

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const DashboardWrapper = styled("div")({
  display: "grid",
  gridTemplateRows: "auto",
  gridTemplateColumns: "auto",
  maxWidth: MAX_DASHBOARD_WIDTH,
  margin: "8px auto 24px auto",
  height: "calc(100% - 56px)",
  overflow: "auto",

  "&::-webkit-scrollbar": {
    display: "none",
  },
});

const CardsWrapper = styled("div")({
  gridArea: "cardsWrapper",
  display: "grid",
  gridTemplateAreas: `
    'card1 card2 card3'
  `,
  justifyItems: "center",
});

const CardWrapper = styled("div")(props => ({
  boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
  margin: "8px",
  border: "2px solid grey",
  gridArea: props.gridArea,
  display: "grid",
  gridTemplateRows: "auto",
  gridTemplateColumns: "auto",
  padding: "16px",
  width: "160px",
}));

const CardNumber = styled(ExtraLargeLabel)(props => ({
  margin: "0 auto 0 auto",
  color: props.theme.brand.primary,
}));

const CardLabel = styled(LargeLabel)({
  margin: "0 auto 0 auto",
  textTransform: "uppercase",
});
const Card = cardProps => {
  return (
    <CardWrapper gridArea={cardProps.gridArea}>
      <CardNumber>{cardProps.number}</CardNumber>
      <CardLabel>{cardProps.label}</CardLabel>
    </CardWrapper>
  );
};

const EngagementWrapper = styled("div")({
  display: "grid",
  gridTemplateRows: "max-content",
});

const SurveyWrapper = styled("div")({
  display: "grid",
  gridTemplateRows: "max-content",
  gridTemplateAreas: `
                    'title'
                    'wards'
                    'categories'
                    'demographics'
                `,
});
const ChartTitle = styled(SmallTitle)({
  margin: "0 auto 0 auto",
  textAlign: "center",
});
const WardsWrapper = styled("div")({
  gridArea: "wards",
});

const CategoriesWrapper = styled("div")({
  gridArea: "categories",
});

const DemographicsWrapper = styled("div")({
  gridArea: "demographics",
});


class Dashboard extends React.Component {
  state = {
    dashboard: this.props.dashboardConfig[0],
    anchorEl: null,
    places: this.props.allPlaces.filter(
      place => place.datasetSlug === this.props.dashboardConfig[0].datasetSlug,
    ),
  };

  componentDidMount() {
    this.props.updateCurrentTemplate("dashboard");

    if (!this.props.hasAdminAbilities(this.state.dashboard.datasetSlug)) {
      this.props.history.push("/");
    }
  }

  componentDidUpdate(nextProps) {
    if (nextProps.allPlaces.length !== this.props.allPlaces.length) {
      this.setState({
        places: this.props.allPlaces.filter(
          place => place.datasetSlug === this.state.dashboard.datasetSlug,
        ),
      });
    }
  }

  getLineChartData = () => {
    // `moment` has better time zone support, so we are using it here
    // instead of `Date`.
    let minDate = moment(8640000000000000); // Sep 13, 275760
    let maxDate = moment(0); // Jan 1, 1970
    const timeZone = this.props.appConfig.time_zone;
    const grouped = this.state.places
      ? groupBy(this.state.places, place => {
          const date = moment(place.created_datetime);
          if (minDate > date) {
            minDate = date;
          }
          if (maxDate < date) {
            maxDate = date;
          }
          return date.tz(timeZone).format("MM/DD/YYYY");
        })
      : {};

    // Get a list of all days in range, to account for days where no posts were made:
    const daysGrouped = getDaysArray(
      new Date(minDate),
      new Date(maxDate),
    ).reduce((memo, date) => {
      memo[
        `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
      ] = [];
      return memo;
    }, {});

    const lineChartData = Object.entries({ ...daysGrouped, ...grouped })
      .map(([day, places]) => ({
        date: new Date(day),
        day,
        count: places.length,
      }))
      .sort((a, b) => {
        return a.date - b.date;
      });

    return lineChartData;
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
      places: this.props.allPlaces.filter(
        place => place.datasetSlug === newDashboardConfig.datasetSlug,
      ),
    });
  };

  render() {
    const commentsCount =
      this.state.places &&
      this.state.places.reduce((count, place) => {
        if (place.submission_sets.comments) {
          count += place.submission_sets.comments.length;
        }
        return count;
      }, 0);
    const supportsCount =
      this.state.places &&
      this.state.places.reduce((count, place) => {
        if (place.submission_sets.support) {
          count += place.submission_sets.support.length;
        }
        return count;
      }, 0);
    const dataset = this.props.datasetsConfig.find(
      config => config.slug === this.state.dashboard.datasetSlug,
    );

    return (
      <DashboardWrapper>
        <HorizontalRule
          css={{
            marginTop: 0,
          }}
        />
        <div
          css={{
            display: "grid",
            gridTemplateAreas: `
              "title dashboard-dropdown"
              "link ."
              "cardsWrapper cardsWrapper"
          `,
            marginBottom: "24px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <RegularTitle css={{ gridArea: "title" }}>Overview</RegularTitle>
          {this.props.dashboardConfig.length > 1 && (
            <div css={{ gridArea: "dashboard-dropdown" }}>
              <Button
                aria-owns={this.state.anchorEl ? "simple-menu" : undefined}
                aria-haspopup="true"
                onClick={this.toggleDashboardDropdown}
                css={theme => ({
                  fontFamily: theme.text.headerFontFamily,
                  marginRight: "16px",
                })}
              >
                View Another Dataset
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
                        this.selectAndCloseDashboardDropdown(dashboardConfig);
                      }}
                    >{`${dataset.clientSlug}s`}</MenuItem>
                  );
                })}
              </Menu>
            </div>
          )}
          <ExternalLink
            css={theme => ({
              textDecoration: "none",
              gridArea: "link",
              marginBottom: "16px",
              fontFamily: theme.text.headerFontFamily,
            })}
            href={`${this.props.apiRoot}${dataset.owner}/datasets/${
              dataset.slug
            }/mapseed-places.csv?format=csv&include_private_places&include_private_fields&page_size=10000`}
          >
            {`Download Submissions`}
          </ExternalLink>
          <CardsWrapper>
            <Card
              gridArea="card1"
              label={`${dataset.clientSlug}s`}
              number={this.state.places ? this.state.places.length : "..."}
            />
            <Card
              gridArea="card2"
              label="Comments"
              number={commentsCount ? commentsCount : "..."}
            />
            <Card
              gridArea="card3"
              label="Supports"
              number={supportsCount ? supportsCount : "..."}
            />
          </CardsWrapper>
        </div>
        <EngagementWrapper>
          <RegularTitle>Engagement</RegularTitle>
          <LineChart
            width={1120}
            height={350}
            data={this.getLineChartData()}
            margin={{ top: 5, right: 30, left: 20, bottom: 24 }}
          >
            <XAxis dataKey="day">
              <Label value="Date" position="bottom" />
            </XAxis>
            <YAxis>
              <Label value={`Number of ${dataset.clientSlug}s`} angle={-90} />
            </YAxis>
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke={BLUE}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </EngagementWrapper>
        {this.state.dashboard.surveyMetrics && (
          <SurveyWrapper>
            <RegularTitle style={{ gridArea: "title" }}>Survey</RegularTitle>
            {/* TODO: Make these charts more data-driven. Right now, they are hard coded for durham */}
            {this.state.dashboard.surveyMetrics.wards && (
              <WardsWrapper>
                <ChartTitle>Wards</ChartTitle>

                {/* getLabelFromCategory is hacked until we can get
                the label from our form field display using a more
                sensible form datastructure */}
                <PieChart
                  places={this.state.places}
                  category="ward"
                  getLabelFromCategory={category => {
                    const firstLetter = category.charAt(0).toUpperCase();
                    return `${firstLetter}${category
                      .replace("_", " ")
                      .slice(1)}`;
                  }}
                  colors={COLORS}
                />
              </WardsWrapper>
            )}
            {this.state.dashboard.surveyMetrics.categories && (
              <CategoriesWrapper>
                <ChartTitle>Categories</ChartTitle>
                <PieChart
                  places={this.state.places}
                  category="location_type"
                  getLabelFromCategory={category =>
                    this.props.placeFormsConfig.find(
                      form => form.id === category,
                    ).label
                  }
                  colors={COLORS}
                />
              </CategoriesWrapper>
            )}
            {this.state.dashboard.surveyMetrics.budget && (
              <DemographicsWrapper>
                <ChartTitle>{`Budget (published proposals)`}</ChartTitle>
                <BarChart
                  barFillColor={BLUE}
                  formFieldConfig={this.props.formFieldsConfig.find(
                    fieldConfig => fieldConfig.id === "ward",
                  )}
                  places={this.state.places.filter(place => {
                    // TODO: make 'place filter' operations data-driven
                    return !place.private;
                  })}
                  xLabel={"Wards"}
                  yAxisTickFormatter={moneyFormatter.format}
                  tooltipFormatter={(value, name, props) =>
                    moneyFormatter.format(props.payload.sum)
                  }
                  category={"ward"}
                  sumOverCategory={"staff_project_budget"}
                  valueAccessor={value => {
                    // TODO: avoid this function by normalizing our
                    // form field values into a number
                    if (!value) {
                      // TODO: set constraints/default on fields to avoid
                      // having to filter these null values
                      return 0;
                    }
                    const match = /\$?([0-9,]+).*/.exec(value.trim());
                    if (!match) {
                      return 0;
                    } else {
                      return Number(match[1].replace(",", ""));
                    }
                  }}
                />
              </DemographicsWrapper>
            )}
            {this.state.dashboard.surveyMetrics.demographics && (
              <DemographicsWrapper>
                <ChartTitle>Demographics</ChartTitle>
                <BarChart
                  barFillColor={BLUE}
                  formFieldConfig={this.props.formFieldsConfig.find(
                    fieldConfig => fieldConfig.id === "private-ethnicity",
                  )}
                  places={this.state.places}
                  footer={
                    "*race/ethinicity may not add up to 100% because of multiple choices"
                  }
                  xLabel={"Ethnicity"}
                  yLabel={"Count"}
                  tooltipFormatter={(value, name, props) =>
                    `${props.payload.count} (${props.payload.percent})`
                  }
                  category={"private-ethnicity"}
                  nullCategoryLabel={"(No response)"}
                />
              </DemographicsWrapper>
            )}
          </SurveyWrapper>
        )}
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
  updateCurrentTemplate: PropTypes.func.isRequired,
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

const mapDispatchToProps = dispatch => ({
  updateCurrentTemplate: templateName =>
    dispatch(updateCurrentTemplate(templateName)),
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Dashboard),
);
