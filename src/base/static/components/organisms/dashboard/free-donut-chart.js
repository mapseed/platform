import React, { Component } from "react";
import PropTypes from "prop-types";
import lodashGroupBy from "lodash.groupby";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

import { COLORS } from "../../../utils/dashboard-utils";
import ChartWrapper from "./chart-wrapper";

const getFreeDonutChartData = ({ dataset, widget }) => {
  // TODO: handle checkbox data.
  const grouped = dataset
    ? lodashGroupBy(dataset, place => place[widget.groupBy])
    : {};
  const pieChartData = Object.entries(grouped).map(([category, places]) => ({
    category: widget.labels[category],
    count: places.length,
  }));

  return pieChartData;
};

class FreeDonutChart extends Component {
  renderPieChartLabel = pieProps => {
    const { category, percent, count, x, y, midAngle } = pieProps;
    let anchor = "middle";
    let dx = 0;
    let dy = 0;

    // Arrange labels nicely around the donut.
    if (midAngle >= 295 || midAngle <= 65) { // Right section of donut.
      dx = 5;
      anchor = "start";
    } else if (midAngle > 65 && midAngle < 115) { // Top section.
      dy = -24;
    } else if (midAngle >= 115 && midAngle < 245) { // Left section.
      dx = -5;
      anchor = "end";
    } else { // Bottom section.
      dy = 15;
    }

    return (
      <text x={x} y={y}>
        <tspan x={x} dx={dx} dy={dy} fill="#888" textAnchor={anchor}>
          {category}
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
      <ChartWrapper layout={this.props.layout}>
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
      </ChartWrapper>
    );
  }
}

FreeDonutChart.propTypes = {
  getLabelFromCategory: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    }),
  ).isRequired,
  layout: PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  }).isRequired,
};

export { getFreeDonutChartData, FreeDonutChart };
