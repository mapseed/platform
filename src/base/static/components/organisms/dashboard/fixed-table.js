/** @jsx jsx */
import React, { Component } from "react";
import { jsx, css } from "@emotion/core";
import PropTypes from "prop-types";

import makeParsedExpression from "../../../utils/expression/parse.tsx";
import ChartWrapper from "./chart-wrapper";

const getFixedTableData = ({ places, widget }) => {
  const columnFilters = widget.columns.map(column => {
    if (column.filter) {
      return makeParsedExpression(column.filter);
    }
  });

  const fixedTableData = widget.rows.map(row => {
    return row.cells.map((cell, i) => {
      const dataset = places.filter(place => {
        if (!columnFilters[i]) {
          return true;
        } else {
          return columnFilters[i].evaluate({ place });
        }
      });

      return makeParsedExpression(cell.value).evaluate({ dataset });
    });
  });

  console.log("fixedTableData", fixedTableData);

  return {};

  /*
 * {
 *    headers: ["foo", "bar", "baz],
 *    rows: [[12, 34], [1, 55], [3, 52]]
 * }
 *
 */
};

class FixedTable extends Component {
  render() {
    return (
      <ChartWrapper layout={this.props.layout} header={this.props.header}>
        O HAI IM UR FIXED TABLE
      </ChartWrapper>
    );
  }
}

FixedTable.propTypes = {};

export { FixedTable, getFixedTableData };
