/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import PropTypes from "prop-types";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import makeParsedExpression from "../../../utils/expression/parse";
import ChartWrapper from "./chart-wrapper";

const fixedTablePropTypes = {
  data: PropTypes.shape({
    columns: PropTypes.arrayOf(
      PropTypes.shape({
        dataKey: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
      }),
    ).isRequired,
    rows: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
            .isRequired,
          label: PropTypes.string,
          type: PropTypes.string.isRequired,
        }).isRequired,
      ).isRequired,
    ).isRequired,
    headers: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }).isRequired,
  header: PropTypes.string.isRequired,
  layout: PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    height: PropTypes.string,
  }).isRequired,
};

type Props = PropTypes.InferProps<typeof fixedTablePropTypes>;

const getFixedTableData = ({ places, widget }) => {
  const columnFilters = widget.columns.map(column => {
    if (column.filter) {
      return makeParsedExpression(column.filter);
    }
  });

  const fixedTableRows = widget.rows.map(row => {
    return row.cells.map((cell, i) => {
      const dataset = places.filter(place => {
        if (!columnFilters[i]) {
          return true;
        } else {
          return columnFilters[i].evaluate({ place });
        }
      });

      const parsedExpression = makeParsedExpression(cell.value);

      return {
        value: parsedExpression && parsedExpression.evaluate({ dataset }),
        label: cell.label,
        type: widget.columns[i].type || "string",
      };
    });
  });

  return {
    headers: widget.columns.map(column => column.header),
    rows: fixedTableRows,
  };
};

class FixedTable extends React.Component<Props> {
  render() {
    return (
      <ChartWrapper layout={this.props.layout} header={this.props.header}>
        <Table>
          <TableHead>
            <TableRow>
              {this.props.data.headers.map(header => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.data.rows.map((row, i) => {
              return (
                <TableRow key={i}>
                  {row.map((cell, i) => (
                    <TableCell key={i} component="th" scope="row">
                      {cell.value} {cell.label}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ChartWrapper>
    );
  }
}

export { FixedTable, getFixedTableData };
