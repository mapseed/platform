/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Label,
  Tooltip,
} from "recharts";
import {
  ChartLayout,
  FreeBarChartWidget,
} from "../../../state/ducks/dashboard-config";

import {
  getFormatter,
  getTooltipFormatter,
  BLUE,
} from "../../../utils/dashboard-utils";
import makeParsedExpression, {
  Expression,
} from "../../../utils/expression/parse";
import { Place } from "../../../state/ducks/places";

type Bar = {
  category: string;
  count: number;
  sum: number;
  label?: string;
  percent: string;
};

type FreeBarChartProps = {
  annotation?: string;
  data: Bar[];
  format?: string;
  groupValue: Expression;
  tooltipFormat?: string;
  labelFormat?: string;
  header: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  layout: ChartLayout;
};

type Labels = {
  [key: string]: string;
};

const NULL_RESPONSE_NAME = "__no-response__";

const getFreeBarChartData = ({
  places,
  widget,
}: {
  places: Place[];
  widget: FreeBarChartWidget;
}) => {
  const labels = {
    ...widget.labels,
    [NULL_RESPONSE_NAME]: "No response",
  };

  if (widget.filter) {
    const parsedFilterExpression = makeParsedExpression(widget.filter);
    places = places.filter(
      place =>
        parsedFilterExpression && parsedFilterExpression.evaluate({ place }),
    );
  }

  const totalPlaces = places ? places.length : 100;
  const grouped = places
    ? places.reduce((groups, place) => {
        const response = place[widget.groupBy]
          ? // Checkbox non-responses are stored as an empty array, so we need
            // to check for that and record it as a null response.
            Array.isArray(place[widget.groupBy]) &&
            place[widget.groupBy].length === 0
            ? NULL_RESPONSE_NAME
            : place[widget.groupBy]
          : NULL_RESPONSE_NAME;
        const responseArray = Array.isArray(response) ? response : [response];

        // Create a memo dict of the response groups, mapped to an array of
        // Places which fall into each group. Note that a Place may fall in
        // more than one group if `widget.groupBy` refers to a checkbox
        // property on the Place model.
        // ie: { "group_1": [Place, Place, Place], "group_2": [Place, Place] }
        responseArray.forEach(group => {
          const isAlreadyWithCategory = !!groups[group];

          if (isAlreadyWithCategory) {
            groups[group] = [...groups[group], { ...place }];
          } else {
            groups[group] = [{ ...place }];
          }
        });

        return { ...groups };
      }, {})
    : {};

  const barChartData = Object.entries(grouped).map(
    ([group, groupedPlaces]: [any, any]) => {
      const parsedExpression = makeParsedExpression(widget.groupValue);

      return {
        value:
          parsedExpression &&
          parsedExpression.evaluate({ dataset: groupedPlaces }),
        label: labels[group] || group,
        totalPlaces,
      };
    },
  );

  return barChartData;
};

class FreeBarChart extends React.Component<FreeBarChartProps> {
  render() {
    return (
      <ResponsiveContainer
        css={css`
          font-family: PTSans-Regular, sans-serif;
        `}
        width="100%"
        height={360}
      >
        <BarChart
          data={this.props.data}
          margin={{
            top: 40,
            right: 30,
            left: 70,
            bottom: this.props.annotation ? 160 : 120,
          }}
        >
          <XAxis
            tickFormatter={getFormatter("truncated")(12)}
            dataKey={"label"}
            angle={-45}
            stroke="#444"
            textAnchor="end"
            interval={0}
          >
            <Label
              content={() => (
                <g>
                  <text x="50%" y={286} fill="#444" textAnchor="middle">
                    {this.props.xAxisLabel}
                  </text>
                  {this.props.annotation && (
                    <text
                      fill="#444"
                      x="50%"
                      y={320}
                      fontSize=".7em"
                      textAnchor="middle"
                    >
                      {this.props.annotation}
                    </text>
                  )}
                </g>
              )}
              offset={96}
              position="bottom"
            />
          </XAxis>
          <YAxis
            stroke="#444"
            tickFormatter={getFormatter(this.props.labelFormat)}
          >
            {this.props.yAxisLabel && (
              <Label
                offset={10}
                fill="#444"
                value={this.props.yAxisLabel}
                angle={-90}
                position="left"
              />
            )}
          </YAxis>
          {this.props.tooltipFormat && (
            <Tooltip
              cursor={false}
              formatter={getTooltipFormatter(this.props.tooltipFormat)}
              labelFormatter={label => label}
            />
          )}
          <Bar dataKey={"value"} fill={BLUE} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}

export { FreeBarChart, getFreeBarChartData };
