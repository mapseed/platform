import * as React from "react";

import makeParsedExpression, {
  Expression,
} from "../../../utils/expression/parse";
import BaseTable from "./base-table";
import {
  ChartLayout,
  FreeTableWidget,
  Column,
  Row,
  FreeTableColumn,
} from "../../../state/ducks/dashboard-config";
import { Place } from "../../../state/ducks/places";

type FreeTableData = {
  columns: FreeTableColumn[];
  rows: Row[];
};

type FreeTableProps = {
  data: FreeTableData;
  header: string;
  layout: ChartLayout;
  stripeColor?: string;
};

const getFreeTableData = ({
  places,
  widget,
  widgetState,
}: {
  places: Place[];
  widget: FreeTableWidget;
  widgetState: any;
}) => {
  const freeTableRows = places.map(place => {
    return widget.columns.reduce((rows, column) => {
      const parsedExpression = makeParsedExpression(column.value);

      // TODO: add table-wide filtering.

      return {
        ...rows,
        [column.header]: {
          type: column.type,
          value: parsedExpression
            ? ([] as (string | boolean | number | Expression)[]).concat(
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

class FreeTable extends React.Component<FreeTableProps> {
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
