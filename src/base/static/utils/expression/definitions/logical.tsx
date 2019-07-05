import { Expression, IEvaluationContext, IParsingContext } from "../expression";

// TODO: other logical operators.

class All implements Expression {
  args;

  constructor(args: Expression[]) {
    this.args = args;
  }

  static parse(
    args: Expression[],
    parsingContext: IParsingContext,
  ): Expression | null {
    const op = args[0];
    if (args.length < 2) {
      // eslint-disable-next-line no-console
      console.error(`Error: expected at least one argument for "${op}"`);

      return null;
    }

    return new All(args);
  }

  evaluate(evaluationContext: IEvaluationContext): boolean {
    for (const arg of args) {
      if (!arg.evaluate(evaluationContext)) {
        return false;
      }
    }

    return true;
  }
};

export { All };
