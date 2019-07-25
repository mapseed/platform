import PropTypes from "prop-types";
import * as React from "react";
import lodashGroupBy from "lodash.groupby";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

import { COLORS } from "../../../utils/dashboard-utils";
import {
  ChartLayout,
  FreeDonutChartWidget,
  DonutWedge,
} from "../../../state/ducks/dashboard-config";
import { Place } from "../../../state/ducks/places";

type FreeDonutChartProps = {
  data: DonutWedge[];
  header: string;
  layout: ChartLayout;
};

const NULL_RESPONSE_NAME = "__no-response__";

const getFreeDonutChartData = ({
  places,
  widget,
}: {
  places: Place[];
  widget: FreeDonutChartWidget;
}) => {
  // TODO: handle checkbox data.
  const grouped = places
    ? lodashGroupBy(places, place => place[widget.groupBy])
    : {};
  const donutChartData = Object.entries(grouped).map(([category, places]) => ({
    category: category || NULL_RESPONSE_NAME,
    label: widget.labels[category] || "No response",
    count: Array.isArray(places) ? places.length : 0,
  }));

  return donutChartData;
};

class FreeDonutChart extends React.Component<FreeDonutChartProps> {
  renderPieChartLabel = pieProps => {
    const { label, percent, count, x, y, midAngle } = pieProps;
    let anchor = "middle";
    let dx = 0;
    let dy = 0;

    // Arrange labels nicely around the donut.
    if (midAngle >= 295 || midAngle <= 65) {
      // Right section of donut.
      dx = 5;
      anchor = "start";
    } else if (midAngle > 65 && midAngle < 115) {
      // Top section.
      dy = -24;
    } else if (midAngle >= 115 && midAngle < 245) {
      // Left section.
      dx = -5;
      anchor = "end";
    } else {
      // Bottom section.
      dy = 15;
    }

    return (
      <text x={x} y={y}>
        <tspan x={x} dx={dx} dy={dy} fill="#888" textAnchor={anchor}>
          {label}
        </tspan>
        <tspan x={x} dx={dx} dy={15} textAnchor={anchor} fill="#222">
          {count} ({(percent * 100).toFixed(0)}
          %)
        </tspan>
      </text>
    );
  };

  render() {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            isAnimationActive={false}
            data={this.props.data}
            dataKey="count"
            nameKey="category"
            outerRadius={70}
            innerRadius={35}
            fill="#8884d8"
            label={this.renderPieChartLabel}
          >
            {this.props.data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }
}

export { getFreeDonutChartData, FreeDonutChart };
