import { Expression, IEvaluationContext } from "../expression";

const getNumericalValsByKey = (dataset, key) => {
  return dataset.reduce((validVals, place) => {
    const val = parseFloat(place[key]);

    return isNaN(val) ? validVals : [...validVals, val];
  }, []);
};

const getPlaceVal = (context: IEvaluationContext, property: string) => {
  const val = context.place[property];

  return typeof val === "undefined" ? null : val;
};

const getDatasetSum = (context: IEvaluationContext, property: string) => {
  const sum = context.dataset.reduce((sum, place) => {
    const val = parseFloat(place[property]);

    return isNaN(val) ? sum : sum + val;
  }, 0);

  return sum;
};

const getDatasetMean = (context: IEvaluationContext, property: string) => {
  const sum = getDatasetSum(context, property);

  return sum / context.dataset.length;
};

const getDatasetMax = (context: IEvaluationContext, property: string) => {
  const vals = getNumericalValsByKey(context.dataset, property);

  return Math.max(...vals);
};

const getDatasetMin = (context: IEvaluationContext, property: string) => {
  const vals = getNumericalValsByKey(context.dataset, property);

  return Math.min(...vals);
};

const getDatasetCount = (context: IEvaluationContext, property: string) => {
  return context.dataset.filter(place => place[property]).length;
};

const makeLookup = (op, lookupFn) => {
  return class Lookup implements Expression {
    property: string;

    constructor(property) {
      this.property = property;
    }

    static parse(args, parsingContext) {
      const op = args[0];
      if (args.length !== 2) {
        // eslint-disable-next-line no-console
        console.error(`Error: expected one argument for "${op}"`);
        return;
      }

      return new Lookup(args[1]);
    }

    evaluate(evaluationContext: IEvaluationContext) {
      return lookupFn(evaluationContext, this.property);
    }
  };
};

export const GetPlaceVal = makeLookup("get-val", getPlaceVal);
export const GetDatasetSum = makeLookup("get-sum", getDatasetSum);
export const GetDatasetMean = makeLookup("get-mean", getDatasetMean);
export const GetDatasetMax = makeLookup("get-max", getDatasetMax);
export const GetDatasetMin = makeLookup("get-min", getDatasetMin);
export const GetDatasetCount = makeLookup("get-count", getDatasetCount);
