import { Expression, IEvaluationContext } from "../expression";

const getSum = (context: IEvaluationContext, operands) => {
  return operands.reduce((sum, operand) => {
    if (isNaN(operand)) {
      // eslint-disable-next-line no-console
      console.error("Error: got non-numerical operand for summation");

      return sum;
    }

    return sum + operand;
  }, 0);
};

const getMean = () => {}; // TODO

const getMax = () => {}; // TODO

const getMin = () => {}; // TODO

const makeAggregation = (op, aggregationFn) => {
  return class Aggregation implements Expression {
    operands;

    constructor(operands) {
      this.operands = operands;
    }

    static parse(args, parsingContext) {
      const operands = args
        .slice(1)
        .map(operand => parsingContext.parse(operand));

      return new Aggregation(operands);
    }

    evaluate(evaluationContext: IEvaluationContext) {
      return aggregationFn(
        evaluationContext,
        this.operands.map(operand => operand.evaluate(evaluationContext)),
      );
    }
  };
};

export const Sum = makeAggregation("sum", getSum);
export const Mean = makeAggregation("mean", getMean);
export const Max = makeAggregation("max", getMax);
export const Min = makeAggregation("min", getMin);
