/** @jsx jsx */
import * as React from "react";
import { jsx, css, ClassNames } from "@emotion/core";
import PropTypes from "prop-types";
import moment from "moment";

import makeParsedExpression from "../../../utils/expression/parse";
import ChartWrapper from "./chart-wrapper";
import BaseTable from "./base-table";

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

const getFreeTableData = ({ places, widget }) => {
  const freeTableRows = places.map(place => {
    return widget.columns.reduce((rows, column) => {
      const parsedExpression = makeParsedExpression(column.value);

      // TODO: add table-wide filtering.

      return {
        ...rows,
        [column.header]: {
          type: column.type,
          value: parsedExpression && parsedExpression.evaluate({ place }),
          label: column.label,
        },
      };
    }, {});
  });

  const freeTableColumns = widget.columns.map(column => ({
    label: column.header,
    dataKey: column.header,
    type: column.type,
    fractionalWidth: column.fractionalWidth || 1,
  }));

  return {
    columns: freeTableColumns,
    rows: freeTableRows,
  };
};

class FreeTable extends React.Component<Props, State> {
  render() {
    return (
      <ChartWrapper layout={this.props.layout} header={this.props.header}>
        <BaseTable
          rows={this.props.data.rows}
          columns={this.props.data.columns}
        />
      </ChartWrapper>
    );
  }
}

export { FreeTable, getFreeTableData };
