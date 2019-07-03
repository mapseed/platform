/** @jsx jsx */
import * as React from "react";
import { jsx, css, ClassNames } from "@emotion/core";
import { AutoSizer, Column, Table } from "react-virtualized";
import Draggable from "react-draggable";
import "react-virtualized/styles.css";

import { DashboardText } from "../../atoms/typography";

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

  formatCellData = (data, type) => {
    switch (type) {
      case "date":
        return moment(data).format("MMM Do, YYYY");
      default:
        return data;
    }
  };

  cellRenderer = ({ cellData, columnIndex, type, rowHeight }) => {
    return (
      <div style={{ height: rowHeight }}>
        {Array.isArray(cellData.value) ? (
          cellData.value.map((cellDataPart, i) => (
            <DashboardText
              key={i}
              weight="bold"
              textAlign={cellData.type === "numeric" ? "right" : "left"}
            >
              {cellDataPart}
            </DashboardText>
          ))
        ) : (
          <DashboardText
            weight="bold"
            textAlign={cellData.type === "numeric" ? "right" : "left"}
          >
            {cellData.value}
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

  headerRenderer = ({ label, dataKey, nextDataKey }) => {
    return (
      <div
        key={dataKey}
        css={css`
          display: flex;
          flex-direction: row;
          justify-content: center;
          padding: 0;
        `}
      >
        <div
          css={css`
            flex: auto;
            display: inline-block;
            max-width: 100%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          `}
        >
          {label}
        </div>
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
              headerHeight={75}
              rowHeight={75}
              rowCount={this.props.rows.length}
              rowGetter={({ index }) => this.props.rows[index]}
            >
              {this.props.columns.map(({ dataKey, type, ...other }, index) => {
                return (
                  <Column
                    width={
                      this.state.columnPercentageWidths[dataKey] *
                      this.state.tableWidth
                    }
                    key={dataKey}
                    headerRenderer={headerProps =>
                      this.headerRenderer({
                        ...headerProps,
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
