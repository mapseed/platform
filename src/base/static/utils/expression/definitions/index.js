import {
  Equals,
  NotEquals,
  LessThan,
  GreaterThan,
  LessThanOrEqual,
  GreaterThanOrEqual,
} from "./comparison.tsx";
import Literal from "./literal.tsx";
import {
  GetPlaceVal,
  GetDatasetSum,
  GetDatasetMean,
  GetDatasetMax,
  GetDatasetMin,
  GetDatasetCount,
} from "./lookup.tsx";
import { Sum, Mean, Max, Min } from "./aggregation.tsx";

export default {
  "==": Equals,
  "!=": NotEquals,
  "<": LessThan,
  ">": GreaterThan,
  "<=": LessThanOrEqual,
  ">=": GreaterThanOrEqual,
  literal: Literal,
  "get-val": GetPlaceVal,
  "get-sum": GetDatasetSum,
  "get-mean": GetDatasetMean,
  "get-max": GetDatasetMax,
  "get-min": GetDatasetMin,
  "get-count": GetDatasetCount,
  sum: Sum,
  mean: Mean,
  max: Max,
  min: Min,
};
