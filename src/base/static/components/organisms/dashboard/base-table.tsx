/** @jsx jsx */
import * as React from "react";
import { jsx, css, ClassNames } from "@emotion/core";
import { AutoSizer, Column, Table } from "react-virtualized";
import Draggable from "react-draggable";
import "react-virtualized/styles.css";

import { DashboardText, ExternalLink } from "../../atoms/typography";
import { isEmailAddress, getFormatter } from "../../../utils/dashboard-utils";

const CELL_FORMAT_WEIGHTS = ["bold", "regular"];
const CELL_FORMAT_COLORS = ["#222", "#888", "#aaa"];
const ROW_HEIGHT = 75;

class BaseTable extends React.Component<Props> {
  static defaultProps = {
    headerHeight: 48,
    rowHeight: 48,
  };

  state = {
    columnPercentageWidths: {},
    tableWidth: 100, // Arbitrary initial width.
  };

  componentDidMount() {
    const fractionalUnit =
      1 /
      this.props.columns.reduce((totalUnits, column) => {
        return totalUnits + column.fractionalWidth;
      }, 0);

    this.setState({
      columnPercentageWidths: this.props.columns.reduce(
        (memo, column) => ({
          ...memo,
          [column.dataKey]: fractionalUnit * column.fractionalWidth,
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
      <div>
        {cellData.value.map((valuePart, i) => {
          const isEmail = isEmailAddress(valuePart);

          return (
            <DashboardText
              css={css`
                text-overflow: ellipsis;
                overflow: hidden;
              `}
              key={i}
              weight={
                CELL_FORMAT_WEIGHTS[
                  i > CELL_FORMAT_WEIGHTS.length - 1
                    ? CELL_FORMAT_WEIGHTS.length - 1
                    : i
                ]
              }
              color={
                isEmail
                  ? "#005999"
                  : CELL_FORMAT_COLORS[
                      i > CELL_FORMAT_COLORS.length - 1
                        ? CELL_FORMAT_COLORS.length - 1
                        : i
                    ]
              }
              textAlign={this.getCellAlignment(cellData.type)}
            >
              {isEmail ? (
                <ExternalLink href={`mailto:${valuePart}`}>
                  {valuePart}
                </ExternalLink>
              ) : (
                getFormatter(cellData.type)(valuePart)
              )}
            </DashboardText>
          );
        })}
        {cellData.label && (
          <DashboardText
            textTransform="uppercase"
            color="#aaa"
            fontSize="0.9rem"
            textAlign={this.getCellAlignment(cellData.type)}
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
      <div
        key={dataKey}
        css={css`
          padding: 0;
          display: flex;
          justify-content: space-between;
        `}
      >
        <DashboardText
          color="#aaa"
          textAlign={columnIndex === 0 ? "left" : this.getCellAlignment(type)}
        >
          {label}
        </DashboardText>
        {nextDataKey && (
          <ClassNames>
            {({ css }) => (
              <Draggable
                axis="x"
                defaultClassName={css`
                  flex: 0 0 16px;
                  z-index: 2;
                  cursor: col-resize;
                  color: #0085ff;
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
                <span
                  css={css`
                    flex: 0 0 12px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  `}
                >
                  ⋮
                </span>
              </Draggable>
            )}
          </ClassNames>
        )}
      </div>
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
