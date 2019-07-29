import PropTypes from "prop-types";

import { Expression } from "../../utils/expression/parse";

export type ChartLayout = {
  start: number;
  end: number;
  height?: number;
};

type WidgetStateControlOption = {
  value: string;
  label: string;
};

type WidgetStateControl = {
  defaultValue: string;
  name: string;
  options: WidgetStateControlOption[];
  title?: string;
};

type Labels = {
  [key: string]: string;
};

export interface Widget {
  header: string;
  type: string;
  layout: ChartLayout;
  widgetStateControls?: WidgetStateControl[];
}

interface LineChartWidget extends Widget {
  xAxisLabel?: string;
  yAxisLabel?: string;
}

type Cell = {
  value: number | string | boolean | Expression;
  label?: string;
};

export interface Column {
  label: string;
  type: string;
  fractionalWidth: number;
  dataKey: string;
  filter?: any;
  header: string;
}

export interface FreeTableColumn extends Column {
  value: any;
}

export type Row = {
  cells: Cell[];
};

interface FixedTableWidget extends Widget {
  columns: Column[];
  rows: Row[];
}

interface FreeTableWidget extends Widget {
  columns: FreeTableColumn[];
  rows: Row[];
}

export type DonutWedge = {
  category: string;
  label: string;
  count: number;
};

interface FreeDonutChartWidget extends Widget {
  labels: Labels;
  groupBy: string;
}

type StatSummaryWidgetRow = {
  type: string;
  label: string;
  properties?: {
    [key: string]: string | boolean | number;
  };
};

export interface StatSummaryWidget extends Widget {
  rows: StatSummaryWidgetRow[];
}

interface FreeBarChartWidget extends Widget {
  labels: Labels;
  filter?: any;
  groupBy: string;
  groupValue: Expression;
}

type DashboardWidgetConfig = {};

type DashboardConfig = {
  header: string;
  isExportable?: boolean;
  backgroundColor?: string;
  datasetSlug: string;
  widgets: (
    | StatSummaryWidget
    | LineChartWidget
    | FreeBarChartWidget
    | FreeDonutChartWidget
    | FixedTableWidget
    | FreeTableWidget)[];
};

export type DashboardsConfig = DashboardConfig[];

export const loadDashboardConfig: any;
export const dashboardConfigSelector: any;
