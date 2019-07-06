import * as React from "react";
import PropTypes from "prop-types";

import makeParsedExpression from "../../../utils/expression/parse";
import BaseTable from "./base-table";

const freeTablePropTypes = {
  data: PropTypes.shape({
    columns: PropTypes.arrayOf(
      PropTypes.shape({
        dataKey: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        fractionalWidth: PropTypes.number.isRequired,
      }).isRequired,
    ).isRequired,
    rows: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.array.isRequired,
          label: PropTypes.string,
          type: PropTypes.string.isRequired,
        }).isRequired,
      ).isRequired,
    ).isRequired,
  }).isRequired,
  layout: PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    height: PropTypes.string,
  }).isRequired,
  stripeColor: PropTypes.string,
};

type Props = PropTypes.InferProps<typeof freeTablePropTypes>;

const getFreeTableData = ({ places, widget, widgetState }) => {
  const freeTableRows = places.map(place => {
    return widget.columns.reduce((rows, column) => {
      const parsedExpression = makeParsedExpression(column.value);

      // TODO: add table-wide filtering.

      return {
        ...rows,
        [column.header]: {
          type: column.type,
          value: parsedExpression
            ? [].concat(
                parsedExpression.evaluate({
                  place,
                  dataset: places,
                  widgetState,
                }),
              )
            : [],
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

class FreeTable extends React.Component<Props> {
  render() {
    return (
      <BaseTable
        rows={this.props.data.rows}
        columns={this.props.data.columns}
        stripeColor={this.props.stripeColor}
      />
    );
  }
}

export { FreeTable, getFreeTableData };
