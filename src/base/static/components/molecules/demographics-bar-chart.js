import React, { Component } from "react";
import PropTypes from "prop-types";
import { placesPropType } from "../../state/ducks/places";
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Label,
  CartesianGrid,
  Tooltip,
} from "recharts";

class BarChart extends Component {
  getBarChartData = () => {
    const totalPlaces = this.props.places ? this.props.places.length : 100;
    // radio is a single category, checkboxes are multiple:
    const isMultiCategory = this.props.formFieldConfig.type === "checkbox";

    const grouped = this.props.places
      ? this.props.places.reduce((memo, place) => {
          // create a memo dict of the response catagories, mapped to an
          // array of places that fit in each category
          // ie: { 'white': [ place1, place2 ], 'black': [ place1, place3 ] }
          const categoryValues = isMultiCategory
            ? place[this.props.category]
            : [place[this.props.category]].filter(
                // TODO: set constraints/default on fields to avoid
                // having to filter these null values
                value => value !== "" && value !== undefined,
              );
          if (categoryValues.length === 0) {
            // TODO: handle nullCategoryLabel when isMultiCategory is false.
            if (!this.props.nullCategoryLabel) {
              // skip categorizing of null values:
              return memo;
            }
            if (memo[this.props.nullCategoryLabel]) {
              memo[this.props.nullCategoryLabel].push(place);
            } else {
              memo[this.props.nullCategoryLabel] = [place];
            }
            return memo;
          }
          categoryValues.forEach(categoryValue => {
            const fieldLabel = this.props.formFieldConfig.content.find(
              content => content.value === categoryValue,
            ).label;
            if (memo[fieldLabel]) {
              memo[fieldLabel].push(place);
            } else {
              memo[fieldLabel] = [place];
            }
          });
          return memo;
        }, {})
      : [];
    const barChartData = Object.entries(grouped).map(
      ([fieldLabel, places]) => ({
        fieldLabel,
        count: places.length,
        percent: `${((places.length * 100) / totalPlaces).toFixed(0)}%`,
        sum: this.props.sumOverCategory
          ? places.reduce(
              (sum, place) =>
                sum +
                this.props.valueAccessor(place[this.props.sumOverCategory]),
              0,
            )
          : null,
      }),
    );
    return barChartData;
  };

  render() {
    const xAxisTickFormatter = label => {
      if (label.length > 18) {
        return `${label.slice(0, 15)}…`;
      } else {
        return label;
      }
    };

    const barChartData = this.getBarChartData();
    const dataKey = this.props.sumOverCategory ? "sum" : "count";
    return (
      <ResponsiveContainer width="100%" height={360}>
        <ReBarChart
          data={barChartData}
          margin={{ top: 5, right: 30, left: 36, bottom: 160 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="fieldLabel"
            tickFormatter={xAxisTickFormatter}
            angle={-45}
            textAnchor="end"
          >
            <Label
              content={() => (
                <g>
                  <text x="50%" y={286} textAnchor="middle">
                    {this.props.xLabel}
                  </text>
                  {this.props.footer && (
                    <text x="50%" y={320} fontSize=".7em" textAnchor="middle">
                      {this.props.footer}
                    </text>
                  )}
                </g>
              )}
              offset={96}
              position="bottom"
            />
          </XAxis>
          <YAxis tickFormatter={this.props.yAxisTickFormatter}>
            {this.props.yLabel && (
              <Label
                offset={10}
                value={this.props.yLabel}
                angle={-90}
                position="left"
              />
            )}
          </YAxis>
          <Tooltip
            labelFormatter={label => label}
            formatter={this.props.tooltipFormatter}
          />
          <Bar dataKey={dataKey} fill={this.props.barFillColor} />
        </ReBarChart>
      </ResponsiveContainer>
    );
  }
}

BarChart.propTypes = {
  places: placesPropType,
  formFieldConfig: PropTypes.object.isRequired,
  barFillColor: PropTypes.string.isRequired,
  footer: PropTypes.string,
  xLabel: PropTypes.string.isRequired,
  yLabel: PropTypes.string,
  category: PropTypes.string.isRequired,
  sumOverCategory: PropTypes.string,
  valueAccessor: PropTypes.func,
  nullCategoryLabel: PropTypes.string,
  yAxisTickFormatter: PropTypes.func,
  tooltipFormatter: PropTypes.func.isRequired,
};

export default BarChart;
