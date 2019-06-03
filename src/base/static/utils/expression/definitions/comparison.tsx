import Expression from "../expression.tsx";

const eq = (a, b) => a === b;
const neq = (a, b) => a !== b;
const lt = (a, b) => a < b;
const gt = (a, b) => a > b;
const lteq = (a, b) => a <= b;
const gteq = (a, b) => a >= b;

const makeComparison = (op, compareBasic) => {
  return class Comparison implements Expression {
    lhs;
    rhs;

    constructor(lhs, rhs) {
      this.lhs = lhs;
      this.rhs = rhs;
    }

    static parse(args, context) {
      const op = args[0];
      if (args.length !== 3) {
        // eslint-disable-next-line no-console
        console.error(`Error: expected two arguments for "${op}"`);
        return;
      }

      const lhs = context.parse(args[1]);
      const rhs = context.parse(args[2]);

      return new Comparison(lhs, rhs);
    }

    evaluate(context) {
      const lhs = this.lhs.evaluate(context);
      const rhs = this.rhs.evaluate(context);

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
