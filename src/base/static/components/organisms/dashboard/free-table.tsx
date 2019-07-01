/** @jsx jsx */
import React, { Component, Fragment } from "react";
import { jsx, css, ClassNames } from "@emotion/core";
import PropTypes from "prop-types";
import { AutoSizer, Column, Table } from "react-virtualized";
import Draggable from "react-draggable";
import "react-virtualized/styles.css";
import moment from "moment";

import makeParsedExpression from "../../../utils/expression/parse";
import ChartWrapper from "./chart-wrapper";

const freeTablePropTypes = {
  data: PropTypes.shape({
    columns: PropTypes.arrayOf(
      PropTypes.shape({
        dataKey: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
      }).isRequired,
    ).isRequired,
    rows: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  }).isRequired,
  header: PropTypes.string.isRequired,
  layout: PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    height: PropTypes.string,
  }).isRequired,
};

type Props = PropTypes.InferProps<typeof freeTablePropTypes>;

interface State {
  columnPercentageWidths: object;
  tableWidth: number;
}

const getFreeTableData = ({ places, widget }) => {
  const freeTableRows = places.map(place => {
    return widget.columns.reduce(
      (rows, column) => ({
        ...rows,
        [column.header]: makeParsedExpression(column.value).evaluate({ place }),
      }),
      {},
    );
  });

  const freeTableColumns = widget.columns.map(column => ({
    label: column.header,
    dataKey: column.header,
    type: column.type,
  }));

  return {
    columns: freeTableColumns,
    rows: freeTableRows,
  };
};

class FreeTable extends Component<Props, State> {
  static defaultProps = {
    headerHeight: 48,
    rowHeight: 48,
  };

  state = {
    columnPercentageWidths: {},
    tableWidth: 100,
  };

  componentDidMount() {
    const initialColumnPercentageWidth = 1 / this.props.data.columns.length;

    this.setState({
      columnPercentageWidths: this.props.data.columns.reduce(
        (memo, column) => ({
          ...memo,
          [column.dataKey]: initialColumnPercentageWidth,
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
        {Array.isArray(cellData) ? (
          cellData.map((cellDataPart, i) => (
            <p
              css={css`
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                margin: 0;
              `}
              key={i}
            >
              {this.formatCellData(cellDataPart, type)}
            </p>
          ))
        ) : (
          <p
            css={css`
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              margin: 0;
            `}
          >
            {this.formatCellData(cellData, type)}
          </p>
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
      </div>
    );
  };

  render() {
    return (
      <ChartWrapper layout={this.props.layout} header={this.props.header}>
        <AutoSizer onResize={this.onResize}>
          {({ height, width }) => {
            return (
              <Table
                width={width}
                height={height}
                headerHeight={75}
                rowHeight={75}
                rowCount={this.props.data.rows.length}
                rowGetter={({ index }) => this.props.data.rows[index]}
              >
                {this.props.data.columns.map(
                  ({ dataKey, type, ...other }, index) => {
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
                            nextDataKey: this.props.data.columns[index + 1]
                              ? this.props.data.columns[index + 1].dataKey
                              : "", // TOOD: last column??
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
                  },
                )}
              </Table>
            );
          }}
        </AutoSizer>
      </ChartWrapper>
    );
  }
}

export { FreeTable, getFreeTableData };
