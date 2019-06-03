/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  Label,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const LineChart = props => (
  <LineChart
    width={1120}
    height={350}
    data={props.data}
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
    <Line type="monotone" dataKey="count" stroke={BLUE} activeDot={{ r: 8 }} />
  </LineChart>
);

LineChart.propTypes = {
  data: PropTypes.object.isRequired
};

export default LineChart;
