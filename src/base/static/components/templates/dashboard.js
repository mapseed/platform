import React, { Component } from "react";
import PropTypes from "prop-types";
import LegacyUtil from "../../js/utils.js";
import {
  dashboardPlacesSelector,
  placesPropType,
} from "../../state/ducks/places";
import {
  dashboardConfigSelector,
  dashboardConfigPropType,
} from "../../state/ducks/dashboard-config";
import {
  placeFormsConfigSelector,
  placeFormsConfigPropType,
  formFieldsConfigSelector,
  formFieldsConfigPropType,
} from "../../state/ducks/forms-config";
import { HorizontalRule } from "../atoms/layout";
import {
  Link,
  RegularTitle,
  LargeTitle,
  SmallTitle,
  LargeLabel,
  ExtraLargeLabel,
} from "../atoms/typography";
import { connect } from "react-redux";
import styled from "react-emotion";

import groupBy from "lodash.groupby";
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Line,
  Label,
  LabelList,
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

const DashboardWrapper = styled("div")({
  display: "grid",
  gridTemplateRows: "auto",
  gridTemplateColumns: "auto",
  maxWidth: MAX_DASHBOARD_WIDTH,
  margin: "8px auto 24px auto",
});

const OverviewWrapper = styled("div")({
  display: "grid",
  gridTemplateRows: "max-content",
  gridTemplateColumns: "1fr 1fr 1fr",
  gridTemplateAreas: `
    'title title title'
    'link link link'
    'card1 card2 card3'
  `,
  marginBottom: "24px",
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
  maxWidth: "160px",
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

const DownloadDataLink = styled(Link)({
  textDecoration: "none",
  gridArea: "link",
  marginBottom: "16px",
});

const EngagementWrapper = styled("div")({
  display: "grid",
  gridTemplateRows: "max-content",
});

const SurveyWrapper = styled("div")({
  display: "grid",
  gridTemplateRows: "max-content",
  gridTemplateAreas: `
                    'title'
                    'categories'
                    'demographics'
                `,
});
const ChartTitle = styled(SmallTitle)({
  margin: "0 auto 0 auto",
  textAlign: "center",
});
const CategoriesWrapper = styled("div")({
  gridArea: "categories",
});

const DemographicsWrapper = styled("div")({
  gridArea: "demographics",
});

const getDaysArray = (start, end) => {
  let arr;
  let dt;
  for (arr = [], dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt));
  }
  return arr;
};

class Dashboard extends Component {
  componentDidMount() {
    if (!LegacyUtil.getAdminStatus(this.props.dashboardConfig.datasetId)) {
      this.props.router.navigate("/", { trigger: true });
    }
  }

  getLineChartData = () => {
    let minDate = new Date(8640000000000000);
    let maxDate = new Date(0);
    const grouped = this.props.places
      ? groupBy(this.props.places, place => {
          const date = new Date(place.created_datetime);
          if (minDate > date) {
            minDate = date;
          }
          if (maxDate < date) {
            maxDate = date;
          }
          return `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`;
        })
      : {};

    // Get a list of all days in range, to account for days where no posts were made:
    const daysGrouped = getDaysArray(minDate, maxDate).reduce((memo, date) => {
      memo[`${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`] = [];
      return memo;
    }, {});

    const linechartData = Object.entries({ ...daysGrouped, ...grouped })
      .map(([day, places]) => ({
        date: new Date(day),
        day,
        count: places.length,
      }))
      .sort((a, b) => {
        return a.date - b.date;
      });

    return linechartData;
  };

  getBarChartData = () => {
    const totalPlaces = this.props.places ? this.props.places.length : 100;

    const grouped = this.props.places
      ? this.props.places.reduce((memo, place) => {
          // add the place to the memo's ethnicity bucket for each
          // ethnicity that was selected
          if (place["private-ethnicity"].length === 0) {
            if (memo["(No response)"]) {
              memo["(No response)"].push(place);
            } else {
              memo["(No response)"] = [place];
            }
            return memo;
          }
          place["private-ethnicity"].forEach(ethnicity => {
            const ethnicityLabel = this.props.formFieldsConfig
              .find(fieldConfig => fieldConfig.id === "private-ethnicity")
              .content.find(content => content.value === ethnicity).label;
            if (memo[ethnicityLabel]) {
              memo[ethnicityLabel].push(place);
            } else {
              memo[ethnicityLabel] = [place];
            }
          });
          return memo;
        }, {})
      : [];
    const piechartData = Object.entries(grouped).map(([ethnicity, places]) => ({
      ethnicity,
      count: places.length,
      percent: `${((places.length * 100) / totalPlaces).toFixed(0)}%`,
    }));
    return piechartData;
  };

  getPieChartData = () => {
    const grouped = this.props.places
      ? groupBy(this.props.places, place => place.location_type)
      : {};
    // NOTE: location_type and form id are the same thing,
    // also category and form label are also the same thing
    const piechartData = Object.entries(grouped).map(
      ([locationType, places]) => ({
        category: this.props.placeFormsConfig.find(
          form => form.id === locationType,
        ).label,
        count: places.length,
      }),
    );
    return piechartData;
  };

  renderPieChartLabel = pieProps => {
    const { category, percent, count } = pieProps;
    return `${category}, ${count} (${(percent * 100).toFixed(0)}%)`;
  };

  render() {
    const commentsCount =
      this.props.places &&
      this.props.places.reduce((count, place) => {
        if (place.submission_sets.comments) {
          count += place.submission_sets.comments.length;
        }
        return count;
      }, 0);
    const supportsCount =
      this.props.places &&
      this.props.places.reduce((count, place) => {
        if (place.submission_sets.support) {
          count += place.submission_sets.support.length;
        }
        return count;
      }, 0);

    const pieChartData = this.getPieChartData();
    const barChartData = this.getBarChartData();

    const barChartTickFormat = label => {
      if (label.length > 18) {
        return `${label.slice(0, 15)}…`;
      } else {
        return label;
      }
    };

    return (
      <DashboardWrapper>
        <LargeTitle>{this.props.dashboardConfig.title}</LargeTitle>
        <HorizontalRule />
        <OverviewWrapper>
          <RegularTitle style={{ gridArea: "title" }}>Overview</RegularTitle>
          <Card
            gridArea="card1"
            label="Ideas"
            number={this.props.places ? this.props.places.length : "..."}
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
          <DownloadDataLink
            href={`${this.props.apiRoot}${
              this.props.dashboardConfig.datasetOwner
            }/datasets/${
              this.props.dashboardConfig.datasetId
            }/mapseed-places.csv?format=csv&include_private=true&page_size=10000`}
          >
            {`Download Survey Data`}
          </DownloadDataLink>
        </OverviewWrapper>
        <EngagementWrapper>
          <RegularTitle>Engagement</RegularTitle>
          <LineChart
            width={1200}
            height={350}
            data={this.getLineChartData()}
            margin={{ top: 5, right: 30, left: 20, bottom: 24 }}
          >
            <XAxis dataKey="day">
              <Label value="Date" position="bottom" />
            </XAxis>
            <YAxis>
              <Label value="Number of Ideas" angle={-90} />
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
        <SurveyWrapper>
          <RegularTitle style={{ gridArea: "title" }}>Survey</RegularTitle>
          <CategoriesWrapper>
            <ChartTitle>Categories</ChartTitle>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  isAnimationActive={false}
                  data={pieChartData}
                  dataKey="count"
                  nameKey="category"
                  outerRadius={80}
                  innerRadius={35}
                  fill="#8884d8"
                  label={this.renderPieChartLabel}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CategoriesWrapper>
          <DemographicsWrapper>
            <ChartTitle>Demographics</ChartTitle>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={barChartData}
                margin={{ top: 5, right: 30, left: 36, bottom: 160 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="ethnicity"
                  tickFormatter={barChartTickFormat}
                  angle={-45}
                  textAnchor="end"
                >
                  <Label
                    content={() => (
                      <g>
                        <text x="50%" y={286} textAnchor="middle">
                          Ethnicity
                        </text>
                        <text
                          x="50%"
                          y={320}
                          fontSize=".7em"
                          textAnchor="middle"
                        >
                          {
                            "*race/ethinicity may not add up to 100% because of multiple choices"
                          }
                        </text>
                      </g>
                    )}
                    offset={96}
                    position="bottom"
                  />
                </XAxis>
                <YAxis>
                  <Label value="Count" angle={-90} position="left" />
                </YAxis>
                <Tooltip
                  labelFormatter={label => label}
                  formatter={(value, name, props) =>
                    `${props.payload.count} (${props.payload.percent})`
                  }
                />
                <Bar dataKey="count" fill={BLUE}>
                  <LabelList dataKey="count" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </DemographicsWrapper>
        </SurveyWrapper>
      </DashboardWrapper>
    );
  }
}

Dashboard.propTypes = {
  dashboardConfig: dashboardConfigPropType.isRequired,
  apiRoot: PropTypes.string,
  router: PropTypes.instanceOf(Backbone.Router),
  places: placesPropType,
  placeFormsConfig: placeFormsConfigPropType.isRequired,
  formFieldsConfig: formFieldsConfigPropType,
};

const mapStateToProps = state => ({
  places: dashboardPlacesSelector(state),
  dashboardConfig: dashboardConfigSelector(state),
  placeFormsConfig: placeFormsConfigSelector(state),
  formFieldsConfig: formFieldsConfigSelector(state),
});

export default connect(mapStateToProps)(Dashboard);
