/** @jsx jsx */
import React, { Component } from "react";
import { jsx, css } from "@emotion/core";
import moment from "moment";
import PropTypes from "prop-types";
import groupBy from "lodash.groupby";
import {
  LineChart,
  Line,
  Label,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { BLUE } from "../../../utils/dashboard-utils";
import ChartWrapper from "./chart-wrapper";

const getDaysArray = (start, end) => {
  let arr;
  let dt;
  for (arr = [], dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt));
  }
  return arr;
};

// Our line charts always assume aggregation by the `created_datetime`
// property on Place models.
const getLineChartData = ({ places, timeZone }) => {
  // `moment` has better time zone support, so we are using it here
  // instead of `Date`.
  let minDate = moment(8640000000000000); // Sep 13, 275760
  let maxDate = moment(0); // Jan 1, 1970
  const grouped = places
    ? groupBy(places, place => {
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
  const daysGrouped = getDaysArray(new Date(minDate), new Date(maxDate)).reduce(
    (memo, date) => {
      memo[
        `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
      ] = [];
      return memo;
    },
    {},
  );

  return Object.entries({ ...daysGrouped, ...grouped })
    .map(([day, places]) => ({
      date: new Date(day),
      day,
      count: places.length,
    }))
    .sort((a, b) => {
      return a.date - b.date;
    });
};

const CustomDot = props => {
  const { cx, cy, value } = props;

  return (
    <svg>
      <circle
        cx={cx}
        cy={cy}
        r={value > 0 ? 3 : 0}
        stroke={BLUE}
        fill="#fff"
        strokeWidth={1}
      />
    </svg>
  );
};

CustomDot.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  value: PropTypes.number,
};

class MapseedLineChart extends Component {
  render() {
    return (
      <ChartWrapper layout={this.props.layout} header={this.props.header}>
        <ResponsiveContainer
          width={"95%"}
          height={200}
          css={css`
            margin: auto;
          `}
        >
          <LineChart
            css={css`
              margin-left: auto;
              margin-right: auto;
              margin-bottom: 16px;
            `}
            margin={{ bottom: 24 }}
            data={this.props.data}
          >
            <XAxis
              dataKey="day"
              stroke="#aaa"
              tickLine={false}
              tick={{ fontSize: 12 }}
            >
              <Label
                value={this.props.xAxisLabel}
                fill="#aaa"
                position="bottom"
              />
            </XAxis>
            <YAxis stroke="#aaa" tickLine={false} tick={{ fontSize: 12 }}>
              <Label
                value={this.props.yAxisLabel}
                fill="#aaa"
                dx={-10}
                angle={-90}
              />
            </YAxis>
            <Tooltip cursor={false} />
            <Line
              type="monotone"
              dataKey="count"
              isAnimationActive={false}
              stroke={BLUE}
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 3, fill: BLUE, stroke: BLUE }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
    );
  }
}

MapseedLineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.instanceOf(Date).isRequired,
      day: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    }),
  ).isRequired,
  header: PropTypes.string,
  yAxisLabel: PropTypes.string,
  xAxisLabel: PropTypes.string,
  layout: PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  }).isRequired,
};

MapseedLineChart.defaultProps = {
  layout: {
    start: 1,
    end: 13,
  },
};

export { MapseedLineChart, getLineChartData };
