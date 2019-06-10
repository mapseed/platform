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
        style={{ height: rowHeight, flex: 1 }}
      >
        {cellData}
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
                {this.props.data.columns.map(({ dataKey, ...other }, index) => {
                  return (
                    <Column
                      key={dataKey}
                      width={200}
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
                })}
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
