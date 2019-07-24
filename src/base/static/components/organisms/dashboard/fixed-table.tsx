import * as React from "react";

import makeParsedExpression, {
  Expression,
} from "../../../utils/expression/parse";
import BaseTable, { Column, Row } from "./base-table";
import { ChartLayout, Widget } from "./chart-wrapper";
import { Place } from "../../../state/ducks/places";

type FixedTableData = {
  columns: Column[];
  rows: Row[];
};

type FixedTableProps = {
  data: FixedTableData;
  header: string;
  layout: ChartLayout;
  stripeColor?: string;
};

interface FixedTableWidget extends Widget {
  columns: Column[];
  rows: Row[];
}

const getFixedTableData = ({
  places,
  widget,
  widgetState,
}: {
  places: Place[];
  widget: FixedTableWidget;
  widgetState: any;
}) => {
  const columnFilters = widget.columns.map(column => {
    if (column.filter) {
      return makeParsedExpression(column.filter);
    }
  });

  const fixedTableRows = widget.rows.map(row => {
    return row.cells.reduce((cells, cell, i) => {
      const filteredDataset = places.filter(place => {
        if (columnFilters && columnFilters[i]) {
          return columnFilters[i]!.evaluate({
            dataset: places,
            place,
            widgetState,
          });
        }

        return true;
      });

      const valueExpression = makeParsedExpression(cell.value);

      return {
        ...cells,
        [widget.columns[i].header]: {
          type: widget.columns[i].type,
          label: cell.label,
          value: valueExpression
            ? ([] as (string | boolean | number | Expression)[]).concat(
                valueExpression.evaluate({
                  dataset: filteredDataset,
                  widgetState,
                }),
              )
            : [],
        },
      };
    }, {});
  });

  const fixedTableColumns = widget.columns.map(column => ({
    label: column.header,
    dataKey: column.header,
    type: column.type,
    fractionalWidth: column.fractionalWidth || 1,
  }));

  return {
    columns: fixedTableColumns,
    rows: fixedTableRows,
  };
};

class FixedTable extends React.Component<FixedTableProps> {
  render() {
    return (
      <BaseTable
        columns={this.props.data.columns}
        rows={this.props.data.rows}
        stripeColor={this.props.stripeColor}
      />
    );
  }
}

export { FixedTable, getFixedTableData };
