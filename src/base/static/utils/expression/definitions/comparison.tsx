import { Expression, EvaluationContext, ParsingContext } from "../parse";
import { getNumericalPart } from "../../dashboard-utils";

// TODO: Add a `to-number` Expression that leverages the `getNumericalPart`
// helper to support numerical coercion in Value Expressions, such that we
// could, if we wanted, write expressions that allow strict equality
// comparisons between numbers and string representations of numbers.
const eq = (a, b) => a === b;
const neq = (a, b) => a !== b;
// For inequality (<, >, <=, =>) comparisons, we assume that we're comparing
// numerical quantities. We attempt to extract a numerical quantity first before
// making the comparison. We rely on `getNumericalPart` to convert `null` values
// returned from other expressions into `undefined`, so we prevent false
// positives from using `null` in inequality comparisons (e.g. `null < 23`
// evaluates to `true` since `null` is treated as 0 in comparisons).
const lt = (a, b) => getNumericalPart(a)! < getNumericalPart(b)!;
const gt = (a, b) => getNumericalPart(a)! > getNumericalPart(b)!;
const lteq = (a, b) => getNumericalPart(a)! <= getNumericalPart(b)!;
const gteq = (a, b) => getNumericalPart(a)! >= getNumericalPart(b)!;

const makeComparison = (op, compareBasic) => {
  return class Comparison implements Expression {
    lhs;
    rhs;

    constructor(lhs, rhs) {
      this.lhs = lhs;
      this.rhs = rhs;
    }

    static parse(
      args: Expression[],
      parsingContext: ParsingContext,
    ): Expression | null {
      const op = args[0];
      if (args.length !== 3) {
        // eslint-disable-next-line no-console
        console.error(`Error: expected two arguments for "${op}"`);

        return null;
      }

      const lhs = parsingContext.parse(args[1], parsingContext);
      const rhs = parsingContext.parse(args[2], parsingContext);

      return new Comparison(lhs, rhs);
    }

    evaluate(evaluationContext: EvaluationContext): boolean {
      const lhs = this.lhs.evaluate(evaluationContext);
      const rhs = this.rhs.evaluate(evaluationContext);

      return compareBasic(lhs, rhs);
    }
  };
};

export const Equals = makeComparison("==", eq);
export const NotEquals = makeComparison("!=", neq);
export const LessThan = makeComparison("<", lt);
export const GreaterThan = makeComparison(">", gt);
export const LessThanOrEqual = makeComparison("<=", lteq);
export const GreaterThanOrEqual = makeComparison(">=", gteq);
