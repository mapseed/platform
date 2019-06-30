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
} from "./lookup";
import { Sum, Mean, Max, Min } from "./aggregation";
import Cat from "./catenation";

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
  cat: Cat,
};
