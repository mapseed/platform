/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import moment from "moment";
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
import { Place } from "../../../state/ducks/places";
import { ChartLayout } from "../../../state/ducks/dashboard-config";

type LineChartPoint = {
  date: Date;
  day: string;
  count: number;
};

type LineChartProps = {
  data: LineChartPoint[];
  header: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  layout: ChartLayout;
};

const DATETIME_FORMAT = "MM-DD-YYYY";

const getDaysArray = (start, end) => {
  const totalDays = end.diff(start, "days") + 1;
  let arr;
  let i;

  for (arr = [], i = 0; i < totalDays; i++) {
    arr.push(moment(start, DATETIME_FORMAT).add(i, "days"));
  }

  return arr;
};

// Our line charts always assume aggregation by the `created_datetime`
// property on Place models.
const getLineChartData = ({
  places,
  timeZone,
}: {
  places: Place[];
  timeZone: string;
}) => {
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

        return date.tz(timeZone).format(DATETIME_FORMAT);
      })
    : {};

  // Get a list of all days in range, to account for days where no posts were made:
  const daysGrouped = getDaysArray(moment(minDate), moment(maxDate)).reduce(
    (memo, date) => {
      memo[date.format(DATETIME_FORMAT)] = [];
      return memo;
    },
    {},
  );

  return Object.entries({ ...daysGrouped, ...grouped })
    .map(([day, places]) => ({
      date: moment(day, DATETIME_FORMAT),
      day,
      count: Array.isArray(places) ? places.length : 0,
    }))
    .sort((a, b) => {
      return a.date.diff(b.date);
    });
};

type CustomDotProps = {
  cx?: number;
  cy?: number;
  value?: number;
};

const CustomDot: React.FunctionComponent<CustomDotProps> = props => {
  const { cx, cy, value } = props;

  return (
    <svg>
      <circle
        cx={cx}
        cy={cy}
        r={value && value > 0 ? 3 : 0}
        stroke={BLUE}
        fill="#fff"
        strokeWidth={1}
      />
    </svg>
  );
};

class MapseedLineChart extends React.Component<LineChartProps> {
  render() {
    return (
      <ResponsiveContainer
        width={"95%"}
        height={this.props.layout.height ? this.props.layout.height - 75 : 250}
        css={css`
          margin: auto;
        `}
      >
        <LineChart margin={{ bottom: 24, top: 36 }} data={this.props.data}>
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
    );
  }
}

export { MapseedLineChart, getLineChartData };
