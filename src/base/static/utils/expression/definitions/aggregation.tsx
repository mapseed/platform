import { Expression, IEvaluationContext, IParsingContext } from "../expression";
import { getNumericalPart } from "../../../utils/dashboard-utils"

const getSum = (context: IEvaluationContext, operands: number[]) => {
  return operands.reduce((sum, operand) => {
    const val = getNumericalPart(operand)

    if (isNaN(val)) {
      // eslint-disable-next-line no-console
      console.error("Error: got non-numerical operand for summation");

      return sum;
    }

    return sum + val;
  }, 0);
};

const getMean = (context: IEvaluationContext, operands: number[]) => {
  const sum = getSum(context, operands);

  return sum / operands.length;
};

const getMax = (context: IEvaluationContext, operands: number[]) => {
  return Math.max(...operands);
};

const getMin = (context: IEvaluationContext, operands: number[]) => {
  return Math.min(...operands);
};

const makeAggregation = (op, aggregationFn) => {
  return class Aggregation implements Expression {
    operands: Expression[];

    constructor(operands) {
      this.operands = operands;
    }

    static parse(
      args: (Expression)[],
      parsingContext: IParsingContext,
    ): Expression | null {
      const operands = args
        .slice(1)
        .map(operand => parsingContext.parse(operand));

      if (operands.length < 1) {
        // eslint-disable-next-line no-console
        console.error(`Error: expected at least one argument for "${op}"`);

        return null;
      }

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
