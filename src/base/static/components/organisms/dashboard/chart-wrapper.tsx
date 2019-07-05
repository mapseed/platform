/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import PropTypes from "prop-types";

import { RegularText, SmallText } from "../../atoms/typography";
import { RadioInput } from "../../atoms/input";
import { FreeDonutChart, getFreeDonutChartData } from "./free-donut-chart";
import { FreeBarChart, getFreeBarChartData } from "./free-bar-chart";
import { MapseedLineChart, getLineChartData } from "./line-chart";
import { StatSummary, getStatSummaryData } from "./stat-summary";
import { FixedTable, getFixedTableData } from "./fixed-table";
import { FreeTable, getFreeTableData } from "./free-table";

const chartWrapperPropTypes = {
  accentColor: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  header: PropTypes.string,
  layout: PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  }).isRequired,
};

type DefaultProps = {
  accentColor: string;
  header: string;
};

type Props = PropTypes.InferProps<typeof chartWrapperPropTypes> &
  Partial<DefaultProps>;

const HEADER_HEIGHT = "48px";

const widgetRegistry = {
  lineChart: {
    component: MapseedLineChart,
    getData: getLineChartData,
  },
  freeDonutChart: {
    component: FreeDonutChart,
    getData: getFreeDonutChartData,
  },
  freeBarChart: {
    component: FreeBarChart,
    getData: getFreeBarChartData,
  },
  statSummary: {
    component: StatSummary,
    getData: getStatSummaryData,
  },
  fixedTable: {
    component: FixedTable,
    getData: getFixedTableData,
  },
  freeTable: {
    component: FreeTable,
    getData: getFreeTableData,
  },
};

class ChartWrapper extends React.Component<Props> {
  static defaultProps: DefaultProps = {
    accentColor: "#f5f5f5",
    header: "Summary",
  };

  state = {
    widgetState: {},
  };

  componentDidMount() {
    const { widgetStateControls } = this.props.widget;
    if (widgetStateControls) {
      this.setState({
        widgetState: {
          ...widgetStateControls.reduce(
            (widgetState, control) => ({
              ...widgetState,
              [control.name]: control.defaultValue,
            }),
            {},
          ),
        },
      });
    }
  }

  onWidgetStateChange = evt => {
    this.setState({
      widgetState: {
        ...this.state.widgetState,
        [evt.currentTarget.name]: evt.currentTarget.value,
      },
    });
  };

  render() {
    const { widget } = this.props;
    const WidgetComponent = widgetRegistry[widget.type].component;

    return (
      <div
        css={css`
          grid-column: ${widget.layout.start} / ${widget.layout.end};
          height: ${widget.layout.height + "px" || "auto"};
          background-color: #fff;
          margin: 8px;
          border-radius: 4px;
          box-sizing: border-box;
          box-shadow: 0 2px 3px hsla(0, 0%, 0%, 0.3),
            0 3px 5px hsla(0, 0%, 0%, 0.1);
        `}
      >
        <div
          css={css`
            height: ${HEADER_HEIGHT};
            color: #777;
            font-weight: 900;
            border-top-right-radius: 4px;
            border-top-left-radius: 4px;
            background-color: ${this.props.accentColor};
            padding: 8px 16px 8px 16px;
          `}
        >
          <RegularText>{widget.header}</RegularText>
          {widget.widgetStateControls &&
            widget.widgetStateControls.map(control => {
              return (
                <div
                  key={control.name}
                  css={css`
                    float: right;
                  `}
                >
                  <SmallText>{control.title}</SmallText>
                  <div>
                    {control.options.map(option => (
                      <label
                        key={option.value}
                        css={css`
                          &:hover {
                            cursor: pointer;
                          }
                        `}
                      >
                        <RadioInput
                          value={option.value}
                          checked={
                            option.value ===
                            this.state.widgetState[control.name]
                          }
                          onChange={this.onWidgetStateChange}
                          name={control.name}
                        />
                        <SmallText
                          css={css`
                            margin-left: 8px;
                            margin-right: 24px;
                          `}
                        >
                          {option.label}
                        </SmallText>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
        <div
          css={css`
            width: 100%;
            height: calc(100% - ${HEADER_HEIGHT});
          `}
        >
          <WidgetComponent
            {...widget}
            data={widgetRegistry[widget.type].getData({
              widget,
              timeZone: this.props.timeZone,
              widgetState: this.state.widgetState,
              places: this.props.places,
            })}
          />
        </div>
      </div>
    );
  }
}

export default ChartWrapper;
