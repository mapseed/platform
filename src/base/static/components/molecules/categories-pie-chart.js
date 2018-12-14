import React, { Component } from "react";
import PropTypes from "prop-types";
import groupBy from "lodash.groupby";
import { placesPropType } from "../../state/ducks/places";
import { placeFormsConfigPropType } from "../../state/ducks/forms-config";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

class CategoriesPieChart extends Component {
  getPieChartData = () => {
    const grouped = this.props.places
      ? groupBy(this.props.places, place => place.location_type)
      : {};
    // NOTE: location_type and form id are the same thing,
    // also category and form label are also the same thing
    const pieChartData = Object.entries(grouped).map(
      ([locationType, places]) => ({
        category: this.props.placeFormsConfig.find(
          form => form.id === locationType,
        ).label,
        count: places.length,
      }),
    );
    return pieChartData;
  };

  renderPieChartLabel = pieProps => {
    const { category, percent, count } = pieProps;
    return `${category}, ${count} (${(percent * 100).toFixed(0)}%)`;
  };

  render() {
    const pieChartData = this.getPieChartData();
    return (
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
              <Cell
                key={index}
                fill={this.props.colors[index % this.props.colors.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }
}

CategoriesPieChart.propTypes = {
  places: placesPropType,
  placeFormsConfig: placeFormsConfigPropType.isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default CategoriesPieChart;
