import React, { Component } from "react";
import PropTypes from "prop-types";
import { placesPropType } from "../../state/ducks/places";
import { formFieldsConfigPropType } from "../../state/ducks/forms-config";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  Label,
  CartesianGrid,
  Tooltip,
} from "recharts";

class DemographicsBarChart extends Component {
  getBarChartData = () => {
    const totalPlaces = this.props.places ? this.props.places.length : 100;

    const grouped = this.props.places
      ? this.props.places.reduce((memo, place) => {
          // add the place to the memo's ethnicity bucket for each
          // ethnicity that was selected
          if (place["private-ethnicity"].length === 0) {
            if (memo["(No response)"]) {
              memo["(No response)"].push(place);
            } else {
              memo["(No response)"] = [place];
            }
            return memo;
          }
          place["private-ethnicity"].forEach(ethnicity => {
            const ethnicityLabel = this.props.formFieldsConfig
              .find(fieldConfig => fieldConfig.id === "private-ethnicity")
              .content.find(content => content.value === ethnicity).label;
            if (memo[ethnicityLabel]) {
              memo[ethnicityLabel].push(place);
            } else {
              memo[ethnicityLabel] = [place];
            }
          });
          return memo;
        }, {})
      : [];
    const barChartData = Object.entries(grouped).map(([ethnicity, places]) => ({
      ethnicity,
      count: places.length,
      percent: `${((places.length * 100) / totalPlaces).toFixed(0)}%`,
    }));
    return barChartData;
  };

  render() {
    const barChartTickFormat = label => {
      if (label.length > 18) {
        return `${label.slice(0, 15)}…`;
      } else {
        return label;
      }
    };

    const barChartData = this.getBarChartData();
    return (
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={barChartData}
          margin={{ top: 5, right: 30, left: 36, bottom: 160 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="ethnicity"
            tickFormatter={barChartTickFormat}
            angle={-45}
            textAnchor="end"
          >
            <Label
              content={() => (
                <g>
                  <text x="50%" y={286} textAnchor="middle">
                    Ethnicity
                  </text>
                  <text x="50%" y={320} fontSize=".7em" textAnchor="middle">
                    {
                      "*race/ethinicity may not add up to 100% because of multiple choices"
                    }
                  </text>
                </g>
              )}
              offset={96}
              position="bottom"
            />
          </XAxis>
          <YAxis>
            <Label value="Count" angle={-90} position="left" />
          </YAxis>
          <Tooltip
            labelFormatter={label => label}
            formatter={(value, name, props) =>
              `${props.payload.count} (${props.payload.percent})`
            }
          />
          <Bar dataKey="count" fill={this.props.barFillColor}>
            <LabelList dataKey="count" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
}

DemographicsBarChart.propTypes = {
  places: placesPropType,
  formFieldsConfig: formFieldsConfigPropType.isRequired,
  barFillColor: PropTypes.string.isRequired,
};

export default DemographicsBarChart;
