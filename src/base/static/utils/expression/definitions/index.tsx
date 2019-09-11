import {
  Equals,
  NotEquals,
  LessThan,
  GreaterThan,
  LessThanOrEqual,
  GreaterThanOrEqual,
} from "./comparison";
import Literal from "./literal";
import {
  GetPlaceVal,
  GetDatasetSum,
  GetDatasetMean,
  GetDatasetMax,
  GetDatasetMin,
  GetDatasetCount,
  GetWidgetState,
} from "./lookup";
import { Product, Sum, Mean, Max, Min } from "./aggregation";
import { Cat, CatJoin } from "./catenation";
import Case from "./case";

export default {
  "==": Equals,
  "!=": NotEquals,
  "<": LessThan,
  ">": GreaterThan,
  "<=": LessThanOrEqual,
  ">=": GreaterThanOrEqual,
  literal: Literal,
  "get-widget-state": GetWidgetState,
  "get-val": GetPlaceVal,
  "get-sum": GetDatasetSum,
  "get-mean": GetDatasetMean,
  "get-max": GetDatasetMax,
  "get-min": GetDatasetMin,
  "get-count": GetDatasetCount,
  "*": Product,
  "+": Sum,
  mean: Mean,
  max: Max,
  min: Min,
  cat: Cat,
  "cat-join": CatJoin,
  case: Case,
};
