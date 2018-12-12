import React, { Component, Fragment } from "react";
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
import { HorizontalRule } from "../atoms/layout";
import {
  Link,
  RegularTitle,
  LargeTitle,
  SmallTitle,
  RegularText,
  LargeLabel,
  SmallLabel,
  ExtraLargeLabel,
} from "../atoms/typography";
import { connect } from "react-redux";
import styled from "react-emotion";

import groupBy from "lodash.groupby";
import {
  LineChart,
  BarChart,
  Bar,
  Legend,
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
// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
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

// NOTE: using template literal syntax, until we figure out how to
// configure 'grid-template-areas' using object syntax
const OverviewWrapper = styled("div")({
  display: "grid",
  gridTemplateRows: "max-content",
  gridTemplateColumns: "1fr 1fr 1fr",
  gridTemplateAreas: `
    'title title title'
    'card1 card2 card3'
    'link link link'
  `,
  marginBottom: "24px",
});

// const CardsWrapper = styled("div")(props => ({
//   justifyContent: "space-around",
// }));

const CardWrapper = styled("div")(props => ({
  // boxShadow: "-0.25em 0.25em 0 rgba(0, 0, 0, 0.1)",
  boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
  // borderRadius: "5px",
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
const ChartWrapper = styled("div")({
  margin: "0 auto 0 auto",
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
    console.log("grouped:", grouped);

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

    console.log("linechartData:", linechartData);
    return linechartData;
  };

  getBarChartData = () => {
    const totalPlaces = this.props.places ? this.props.places.length : 100;

    const ethnicityLabelMappings = {
      "indian-alaskan": "American Indian/Alaskan Native",
      asian: "Asian",
      black: "Black or African American",
      hispanic: "Hispanic or Latinx",
      "hawaiian-pacific": "Native Hawaiian or Pacific Islander",
      white: "White",
      "other-ethnicity": "Other",
    };
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
            const ethnicityLabel = ethnicityLabelMappings[ethnicity];
            if (memo[ethnicityLabel]) {
              memo[ethnicityLabel].push(place);
            } else {
              memo[ethnicityLabel] = [place];
            }
          });
          return memo;
        }, {})
      : [];
    console.log("grouped:", grouped);
    const piechartData = Object.entries(grouped).map(([ethnicity, places]) => ({
      ethnicity,
      count: places.length,
      percent: `${(places.length / totalPlaces).toFixed(0)}`,
    }));
    console.log("barChartData:", piechartData);
    return piechartData;
  };

  getPieChartData = () => {
    const grouped = this.props.places
      ? groupBy(this.props.places, place => place.location_type)
      : {};
    const piechartData = Object.entries(grouped).map(([category, places]) => ({
      category,
      count: places.length,
    }));
    console.log("pieChartData:", piechartData);
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

    const barChartTicks = barChartData.map(datum => {
      if (datum.ethnicity.length > 18) {
        return `${datum.ethnicity.slice(0, 15)}…`;
      } else {
        return datum.ethnicity;
      }
    });
    const tickFormat = label => {
      console.log("tickformat: label:", label);
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
            {/* <Legend /> */}
            <Line
              type="monotone"
              dataKey="count"
              stroke={BLUE}
              activeDot={{ r: 8 }}
            />
            {/*<Line type="monotone" dataKey="count" stroke="#82ca9d" />*/}
          </LineChart>
        </EngagementWrapper>
        <SurveyWrapper>
          <RegularTitle style={{ gridArea: "title" }}>Survey Data</RegularTitle>
          <CategoriesWrapper>
            <ChartTitle>Categories</ChartTitle>
            <ChartWrapper>
              <PieChart width={500} height={400}>
                <Pie
                  isAnimationActive={false}
                  data={pieChartData}
                  dataKey="count"
                  nameKey="category"
                  cx={200}
                  cy={200}
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
            </ChartWrapper>
          </CategoriesWrapper>
          <DemographicsWrapper>
            <ChartTitle>Demographics</ChartTitle>
            <ChartWrapper>
              <BarChart
                width={1200}
                height={350}
                data={barChartData}
                margin={{ top: 5, right: 30, left: 36, bottom: 160 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="ethnicity"
                  tickFormatter={tickFormat}
                  angle={-45}
                  textAnchor="end"
                >
                  <Label value="Ethnicity" offset={96} position="bottom" />
                </XAxis>
                <YAxis>
                  <Label value="Count" angle={-90} position="left" />
                </YAxis>
                {/* <YAxis yAxisId="right" orientation="left" /> */}
                <Tooltip />
                {/* <Bar yAxisId="right" dataKey="count" fill={BLUE}> */}
                <Bar dataKey="count" fill={BLUE}>
                  <LabelList dataKey="count" position="top" />
                </Bar>
              </BarChart>
            </ChartWrapper>
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
};

const mapStateToProps = state => ({
  places: dashboardPlacesSelector(state),
  dashboardConfig: dashboardConfigSelector(state),
});

export default connect(mapStateToProps)(Dashboard);
