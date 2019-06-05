/** @jsx jsx */
import React, { Component, createRef } from "react";
import { jsx, css } from "@emotion/core";
import { findDOMNode } from "react-dom";
import moment from "moment";
import PropTypes from "prop-types";
import groupBy from "lodash.groupby";
import { LineChart, Line, Label, XAxis, YAxis, Tooltip } from "recharts";

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
const getLineChartData = ({ dataset, timeZone }) => {
  // `moment` has better time zone support, so we are using it here
  // instead of `Date`.
  let minDate = moment(8640000000000000); // Sep 13, 275760
  let maxDate = moment(0); // Jan 1, 1970
  const grouped = dataset
    ? groupBy(dataset, place => {
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
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

// TODO: ResponsiveContainer
class MapseedLineChart extends Component {
  chartWrapperRef = createRef();
  state = {
    width: 0,
  };

  componentDidMount() {
    const wrapperDims = findDOMNode(
      this.chartWrapperRef.current,
    ).getBoundingClientRect();

    this.setState({
      width: wrapperDims.width - 32,
    });
  }

  render() {
    return (
      <ChartWrapper ref={this.chartWrapperRef}>
        <LineChart
          css={css`
            margin-left: auto;
            margin-right: auto;
            margin-bottom: 16px;
          `}
          margin={{ bottom: 24 }}
          width={this.state.width}
          height={200}
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
            dot={<CustomDot />}
            activeDot={{ r: 3, fill: BLUE, stroke: BLUE }}
          />
        </LineChart>
      </ChartWrapper>
    );
  }
}

MapseedLineChart.propTypes = {
  data: PropTypes.object.isRequired,
  yAxisLabel: PropTypes.string,
  xAxisLabel: PropTypes.string,
};

export { MapseedLineChart, getLineChartData };
