/** @jsx jsx */
import * as React from "react";
import { jsx, css, ClassNames } from "@emotion/core";
import { AutoSizer, Column, Table } from "react-virtualized";
import Draggable from "react-draggable";
import "react-virtualized/styles.css";

import { DashboardText, ExternalLink } from "../../atoms/typography";
import { isEmailAddress, getFormatter } from "../../../utils/dashboard-utils";
import { Badge } from "../../atoms/typography";

const CELL_FORMAT_WEIGHTS = ["bold", "regular"];
const CELL_FORMAT_COLORS = ["#222", "#888", "#aaa"];
const ROW_HEIGHT = 75;
const clamp = (arr, i) => (i > arr.length - 1 ? arr[arr.length - 1] : arr[i]);

class BaseTable extends React.Component<Props> {
  state = {
    columnPercentageWidths: {},
    tableWidth: 100, // Arbitrary initial width.
  };

  componentDidMount() {
    // Compute the base unit for calculating column percentage widths.
    const baseFractionalUnit =
      1 /
      this.props.columns.reduce((totalUnits, column) => {
        return totalUnits + column.fractionalWidth;
      }, 0);

    this.setState({
      columnPercentageWidths: this.props.columns.reduce(
        (memo, column) => ({
          ...memo,
          [column.dataKey]: baseFractionalUnit * column.fractionalWidth,
        }),
        {},
      ),
    });
  }

  onResize = ({ width }) => {
    this.setState({
      tableWidth: width,
    });
  };

  getCellAlignment = type => {
    switch (type) {
      case "numeric":
        return "right";
      case "boolean":
        return "center";
      case "text":
        return "left";
      default:
        return "left";
    }
  };

  cellRenderer = ({ cellData, columnIndex, type, rowHeight }) => {
    return (
      <div
        css={css`
          width: 100%;
          padding: 8px;
        `}
      >
        {cellData.value.map((valuePart, i) => {
          const isEmail = isEmailAddress(valuePart);

          return type === "badge" ? (
            <div
              key={i}
              css={css`
                display: flex;
                justify-content: center;
              `}
            >
              <Badge color={valuePart.color}>
                <DashboardText weight="bold" fontSize="0.9rem">
                  {valuePart.label}
                </DashboardText>
              </Badge>
            </div>
          ) : (
            <DashboardText
              key={i}
              textAlign={this.getCellAlignment(type)}
              weight={clamp(CELL_FORMAT_WEIGHTS, i)}
              color={isEmail ? "#005999" : clamp(CELL_FORMAT_COLORS, i)}
            >
              {isEmail ? (
                <ExternalLink href={`mailto:${valuePart}`}>
                  {valuePart}
                </ExternalLink>
              ) : (
                getFormatter(type)(valuePart)
              )}
            </DashboardText>
          );
        })}
        {cellData.label && (
          <DashboardText
            textAlign={this.getCellAlignment(type)}
            textTransform="uppercase"
            color="#aaa"
            fontSize="0.9rem"
          >
            {cellData.label}
          </DashboardText>
        )}
      </div>
    );
  };

  resizeRow = ({ dataKey, deltaX, nextDataKey }) =>
    this.setState(prevState => {
      const prevWidths = prevState.columnPercentageWidths;
      const percentDelta = deltaX / this.state.tableWidth;

      return {
        columnPercentageWidths: {
          ...prevWidths,
          [dataKey]: prevWidths[dataKey] + percentDelta,
          [nextDataKey]: prevWidths[nextDataKey] - percentDelta,
        },
      };
    });

  headerRenderer = ({ label, dataKey, nextDataKey, columnIndex, type }) => {
    return (
      <ClassNames>
        {({ css }) => (
          <Draggable
            axis="x"
            defaultClassName={css`
              z-index: 2;
              cursor: col-resize;
            `}
            onDrag={(event, { deltaX }) =>
              this.resizeRow({
                dataKey,
                deltaX,
                nextDataKey,
              })
            }
            position={{ x: 0, y: 0 }}
          >
            <DashboardText color="#aaa">{label}</DashboardText>
          </Draggable>
        )}
      </ClassNames>
    );
  };

  render() {
    return (
      <AutoSizer onResize={this.onResize}>
        {({ height, width }) => {
          return (
            <Table
              width={width}
              height={height}
              headerHeight={ROW_HEIGHT}
              rowHeight={ROW_HEIGHT}
              rowCount={this.props.rows.length}
              rowGetter={({ index }) => this.props.rows[index]}
              rowStyle={({ index }) => ({
                backgroundColor:
                  index % 2 === 0
                    ? this.props.stripeColor || "initial"
                    : "initial",
              })}
            >
              {this.props.columns.map(({ dataKey, type, ...other }, index) => {
                return (
                  <Column
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: `${ROW_HEIGHT}px`,
                      borderRight:
                        index === 0 ? "3px solid #dedede" : "1px solid #dedede",
                      marginRight: 0,
                    }}
                    headerStyle={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: `${ROW_HEIGHT}px`,
                      borderRight:
                        index === 0 ? "3px solid #dedede" : "1px solid #dedede",
                      marginRight: 0,
                      padding: "4px",
                      boxSizing: "border-box",
                    }}
                    width={
                      this.state.columnPercentageWidths[dataKey] *
                      this.state.tableWidth
                    }
                    key={dataKey}
                    headerRenderer={headerProps =>
                      this.headerRenderer({
                        ...headerProps,
                        type,
                        columnIndex: index,
                        nextDataKey: this.props.columns[index + 1]
                          ? this.props.columns[index + 1].dataKey
                          : null,
                      })
                    }
                    cellRenderer={cellProps =>
                      this.cellRenderer({
                        ...cellProps,
                        columnIndex: index,
                        type,
                      })
                    }
                    dataKey={dataKey}
                    {...other}
                  />
                );
              })}
            </Table>
          );
        }}
      </AutoSizer>
    );
  }
}

export default BaseTable;
