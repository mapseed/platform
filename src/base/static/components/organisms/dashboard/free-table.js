/** @jsx jsx */
import React, { Component } from "react";
import { jsx, css } from "@emotion/core";
import PropTypes from "prop-types";
import TableCell from "@material-ui/core/TableCell";
import { AutoSizer, Column, Table } from "react-virtualized";

import makeParsedExpression from "../../../utils/expression/parse.tsx";
import ChartWrapper from "./chart-wrapper";

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

class FreeTable extends Component {
  static defaultProps = {
    headerHeight: 48,
    rowHeight: 48,
  };

  cellRenderer = ({ cellData, columnIndex }) => {
    const { columns, classes, rowHeight, onRowClick } = this.props;
    return (
      <TableCell
        component="div"
        variant="body"
        style={{ height: rowHeight, flex: 1, wordWrap: "wrap-all" }}
      >
        {Array.isArray(cellData) ? (
          cellData.map((cell, i) => (
            <p
              css={css`
                margin: 0;
              `}
              key={i}
            >
              {cell}
            </p>
          ))
        ) : (
          <p
            css={css`
              margin: 0;
            `}
          >
            {cellData}
          </p>
        )}
      </TableCell>
    );
  };

  headerRenderer = ({ label, columnIndex }) => {
    return (
      <TableCell
        component="div"
        variant="head"
        style={{ display: "flex", flex: 1, height: "48px" }}
      >
        <span>{label}</span>
      </TableCell>
    );
  };

  getWidthByType(type) {
    // These widths are pretty arbitrary...
    switch (type) {
      case "string":
        return 250;
      case "boolean":
        return 50;
      case "date":
        return 150;
      case "numeric":
        return 150;
      default:
        return 250;
    }
  }

  render() {
    const { classes, ...tableProps } = this.props;
    return (
      <ChartWrapper layout={this.props.layout} header={this.props.header}>
        <AutoSizer>
          {({ height, width }) => {
            return (
              <Table
                width={width}
                height={height}
                rowHeight={75}
                rowCount={this.props.data.rows.length}
                rowGetter={({ index }) => this.props.data.rows[index]}
                columns={this.props.data.columns}
                rowStyle={{ display: "flex" }}
              >
                {this.props.data.columns.map(
                  ({ dataKey, type, ...other }, index) => {
                    return (
                      <AutoSizer>
                        {({ width }) => {
                          return (
                            <Column
                              key={dataKey}
                              width={width}
                              headerRenderer={headerProps =>
                                this.headerRenderer({
                                  ...headerProps,
                                  columnIndex: index,
                                })
                              }
                              style={{ display: "flex" }}
                              cellRenderer={this.cellRenderer}
                              dataKey={dataKey}
                              {...other}
                            />
                          );
                        }}
                      </AutoSizer>
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

FreeTable.propTypes = {};

export { FreeTable, getFreeTableData };
