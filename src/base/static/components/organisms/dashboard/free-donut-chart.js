import React, { Component } from "react";
import PropTypes from "prop-types";
import lodashGroupBy from "lodash.groupby";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

import { COLORS } from "../../../utils/dashboard-utils";
import ChartWrapper from "./chart-wrapper";

const getFreeDonutChartData = ({ dataset, widget }) => {
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
    console.log("pieProps", pieProps);
    const { category, percent, count, x, y } = pieProps;
    let anchor = "middle";
    let dx = 0;
    let dy = 0;
    if (midAngle >= 315 && midAngle <= 45) {
      dy = -15;
    } else if (midAngle > 45 && midAngle < 135) {
      anchor = "start";
      dx = 15;
    } else if (midAngle >= 135 && midAngle < 225) {
      dy = 15;
    } else {
      dx = -15;
      anchor = "end";
    }

    return (
      <text x={x} y={y} textAnchor={"middle"}>
        <tspan x={x} fill="#aaa">
          {category}
        </tspan>
        <tspan x={x} dy={15} fill="#666">
          {count} ({(percent * 100).toFixed(0)}
          %)
        </tspan>
      </text>
    );
  };

  render() {
    return (
      <ChartWrapper layout={this.props.layout}>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              isAnimationActive={false}
              data={this.props.data}
              dataKey="count"
              nameKey="category"
              outerRadius={80}
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
