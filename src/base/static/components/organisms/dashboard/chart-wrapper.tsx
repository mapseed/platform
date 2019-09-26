/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import domtoimage from "dom-to-image";
import download from "downloadjs";

import { SmallText, TinyTitle } from "../../atoms/typography";
import { RadioInput } from "../../atoms/input";
import { Button } from "../../atoms/buttons";
import { FontAwesomeIcon, LoadingBar } from "../../atoms/imagery";
import { FreeDonutChart, getFreeDonutChartData } from "./free-donut-chart";
import { FreeBarChart, getFreeBarChartData } from "./free-bar-chart";
import { MapseedLineChart, getLineChartData } from "./line-chart";
import { StatSummary, getStatSummaryData } from "./stat-summary";
import { FixedTable, getFixedTableData } from "./fixed-table";
import { FreeTable, getFreeTableData } from "./free-table";
import { Place } from "../../../state/ducks/places";
import { Widget } from "../../../state/ducks/dashboard-config";

type ChartWrapperProps = {
  widget: Widget;
  widgetIndex: number;
  timeZone: string;
  places: Place[];
};

const HEADER_HEIGHT = "56px";

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

class ChartWrapper extends React.Component<ChartWrapperProps> {
  state = {
    widgetState: {},
    isExporting: false,
  };
  chartRef = React.createRef<HTMLDivElement>();

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

  getIconClassname = type => {
    switch (type) {
      case "fixedTable":
      case "freeTable":
      case "statSummary":
        return "fas fa-table";
      case "lineChart":
        return "fas fa-chart-line";
      case "freeDonutChart":
        return "fas fa-chart-pie";
      case "freeBarChart":
        return "fas fa-chart-bar";
      default:
        return "fas fa-table";
    }
  };

  handleChartExport = () => {
    if (!this.chartRef.current) {
      // eslint-disable-next-line no-console
      console.error("Chart exporter: no ref to export");

      return;
    }

    this.setState({
      isExporting: true,
    });

    const { offsetHeight, offsetWidth } = this.chartRef.current;

    domtoimage
      .toPng(this.chartRef.current, {
        // Render at 2X size and scale back down, to improve resolution.
        height: offsetHeight * 2,
        width: offsetWidth * 2,
        style: {
          transform: `scale(2) translate(${offsetWidth / 4}px, ${offsetHeight /
            4}px)`,
        },
      })
      .then(dataUrl => {
        download(dataUrl, "mapseed-chart.png");
        this.setState({
          isExporting: false,
        });
      })
      .catch(error => {
        this.setState({
          isExporting: false,
        });

        // eslint-disable-next-line no-console
        console.error(error);
      });
  };

  render() {
    const { widget } = this.props;
    const WidgetComponent = widgetRegistry[widget.type].component;

    return (
      <div
        ref={this.chartRef}
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
            max-height: ${HEADER_HEIGHT};
            color: #777;
            font-weight: 900;
            border-top-right-radius: 4px;
            border-top-left-radius: 4px;
            background-color: #f5f5f5;
            padding: 8px 16px 8px 16px;
            box-sizing: border-box;
          `}
        >
          <FontAwesomeIcon
            color="#777"
            hoverColor="#777"
            faClassname={this.getIconClassname(widget.type)}
          />
          <TinyTitle
            css={css`
              margin: 0 0 0 12px;
              display: inline-block;
            `}
          >
            {widget.header}
          </TinyTitle>
          {widget.isExportable && (
            <div
              css={css`
                display: flex;
                min-width: 20px;
                min-height: 20px;
                align-items: center;
                justify-content: center;
                float: right;
                position: relative;
                margin-left: 16px;
              `}
            >
              {this.state.isExporting ? (
                <div
                  css={css`
                    width: 20px;
                    height: 20px;
                  `}
                >
                  <LoadingBar />
                </div>
              ) : (
                <Button
                  css={css`
                    background: none;
                    padding: 0;

                    &:hover {
                      background: none;
                    }
                  `}
                  onClick={this.handleChartExport}
                >
                  <FontAwesomeIcon
                    color="#777"
                    hoverColor="#aaa"
                    faClassname="fas fa-file-download"
                  />
                </Button>
              )}
            </div>
          )}
          {widget.widgetStateControls &&
            widget.widgetStateControls.map(control => {
              return (
                <div
                  key={control.name}
                  css={css`
                    float: right;
                  `}
                >
                  <SmallText
                    css={css`
                      display: block;
                      border-bottom: 0.5px solid #ddd;
                      padding-bottom: 4px;
                      margin-bottom: 4px;
                    `}
                  >
                    {control.title}
                  </SmallText>
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
