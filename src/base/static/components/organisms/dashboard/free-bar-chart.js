import React, { Component } from "react";
import PropTypes from "prop-types";
import { placesPropType } from "../../../state/ducks/places";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Label,
  Tooltip,
} from "recharts";

import ChartWrapper from "./chart-wrapper";
import {
  getFormatter,
  getNumericalPart,
  BLUE,
} from "../../../utils/dashboard-utils";

const NULL_RESPONSE_NAME = "__no-response__";

const getFreeBarChartData = ({ dataset, widget }) => {
  const labels = {
    ...widget.labels,
    [NULL_RESPONSE_NAME]: "(No response)",
  };

  const totalPlaces = dataset ? dataset.length : 100;
  const grouped = dataset
    ? dataset.reduce((memo, place) => {
        // Create a memo dict of the response categories, mapped to a count of
        // Places that fit in each category.
        // ie: { 'white': 2, 'black': 7 }
        const response = place[widget.groupBy]
          ? place[widget.groupBy]
          : NULL_RESPONSE_NAME;
        const responseArray = Array.isArray(response) ? response : [response];

        responseArray.forEach(categoryName => {
          if (memo[categoryName]) {
            memo[categoryName].count++;
            memo[categoryName].sum += getNumericalPart(response);
          } else {
            memo[categoryName] = {
              count: 1,
              sum: getNumericalPart(response),
            };
          }
        });

        return memo;
      }, {})
    : [];

  const barChartData = Object.entries(grouped).map(
    ([categoryName, categoryInfo]) => {
      return {
        ...categoryInfo,
        label: labels[categoryName],
        categoryName,
        percent: `${((categoryInfo.count / totalPlaces) * 100).toFixed(0)}%`,
      };
    },
  );

  return barChartData;
};

class FreeBarChart extends Component {
  render() {
    const dataKey = this.props.sumOverCategory ? "sum" : "count";
    return (
      <ChartWrapper layout={this.props.layout}>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={this.props.data}
            margin={{ top: 5, right: 30, left: 36, bottom: 160 }}
          >
            <XAxis
              tickFormatter={getFormatter("truncated")(15)}
              dataKey="label"
              angle={-45}
              textAnchor="end"
            >
              <Label
                content={() => (
                  <g>
                    <text x="50%" y={286} textAnchor="middle">
                      {this.props.xAxisLabel}
                    </text>
                    {this.props.footer && (
                      <text x="50%" y={320} fontSize=".7em" textAnchor="middle">
                        {this.props.annotation}
                      </text>
                    )}
                  </g>
                )}
                offset={96}
                position="bottom"
              />
            </XAxis>
            <YAxis tickFormatter={getFormatter(this.props.format)}>
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
            <Bar dataKey={dataKey} fill={BLUE} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    );
  }
}

FreeBarChart.propTypes = {
  places: placesPropType,
  footer: PropTypes.string,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string,
  category: PropTypes.string.isRequired,
  sumOverCategory: PropTypes.string,
  valueAccessor: PropTypes.func,
  nullCategoryLabel: PropTypes.string,
  tooltipFormatter: PropTypes.func.isRequired,
};

export { FreeBarChart, getFreeBarChartData };
