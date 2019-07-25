import { Expression, EvaluationContext } from "../parse";
import { getNumericalPart } from "../../../utils/dashboard-utils";
import makeParsedExpression from "../parse";

const getNumericalValsByKey = (dataset, key) => {
  return dataset.reduce((validVals, place) => {
    const val = getNumericalPart(place[key]);

    return isNaN(Number(val)) ? validVals : [...validVals, val];
  }, []);
};

const getPlaceVal = (context: EvaluationContext, property: string) => {
  const val = context.place ? context.place[property] : undefined;

  return typeof val === "undefined" ? null : val;
};

const getDatasetSum = (
  context: EvaluationContext,
  property: string,
  placeCondition?: Expression,
) => {
  const sum = context.dataset
    ? context.dataset.reduce((sum, place) => {
        const val = getNumericalPart(place[property]);

        if (isNaN(Number(val))) {
          return sum;
        }

        if (placeCondition) {
          const conditionExpression = makeParsedExpression(placeCondition);

          return conditionExpression &&
            conditionExpression.evaluate({
              place,
              dataset: context.dataset,
              widgetState: context.widgetState,
            })
            ? sum + val!
            : sum;
        }

        return sum + val!;
      }, 0)
    : 0;

  return sum;
};

const getDatasetMean = (context: EvaluationContext, property: string) => {
  const sum = getDatasetSum(context, property);

  return context.dataset ? sum / context.dataset.length : 0;
};

const getDatasetMax = (context: EvaluationContext, property: string) => {
  const vals = context.dataset
    ? getNumericalValsByKey(context.dataset, property)
    : [];

  return Math.max(...vals);
};

const getDatasetMin = (context: EvaluationContext, property: string) => {
  const vals = context.dataset
    ? getNumericalValsByKey(context.dataset, property)
    : [];

  return Math.min(...vals);
};

const getDatasetCount = (context: EvaluationContext, property: string) => {
  return context.dataset
    ? // getDatasetCount counts Places in a dataset, optionally filtered by a
      // Place property.
      context.dataset.filter(place => (property ? place[property] : true))
        .length
    : 0;
};

const getWidgetState = (context: EvaluationContext, property: string) => {
  const val = context.widgetState ? context.widgetState[property] : undefined;

  return typeof val === "undefined" ? null : val;
};

const makeLookup = (op: string, lookupFn: any) => {
  return class Lookup implements Expression {
    property: string;
    placeCondition?: Expression;
    type: string;

    constructor(property: string, placeCondition?: Expression) {
      this.property = property;
      this.placeCondition = placeCondition;
      this.type = op;
    }

    static parse(args) {
      if (op === "get-count" && args.length > 2) {
        // eslint-disable-next-line no-console
        console.error(`Error: expected one or zero arguments for "${op}"`);

        return null;
      } else if (args.length > 3) {
        // eslint-disable-next-line no-console
        console.error(`Error: expected one or two arguments for "${op}"`);

        return null;
      }

      return new Lookup(args[1], args[2]);
    }

    evaluate(evaluationContext: EvaluationContext) {
      return lookupFn(evaluationContext, this.property, this.placeCondition);
    }
  };
};

export const GetWidgetState = makeLookup("get-widget-state", getWidgetState);
export const GetPlaceVal = makeLookup("get-val", getPlaceVal);
export const GetDatasetSum = makeLookup("get-sum", getDatasetSum);
export const GetDatasetMean = makeLookup("get-mean", getDatasetMean);
export const GetDatasetMax = makeLookup("get-max", getDatasetMax);
export const GetDatasetMin = makeLookup("get-min", getDatasetMin);
export const GetDatasetCount = makeLookup("get-count", getDatasetCount);
