import {
  Expression,
  EvaluationContext,
  ParsingContext,
  ParsedExpression,
} from "../parse";

class Any implements Expression {
  branches;

  constructor(branches: Expression[]) {
    this.branches = branches;
  }

  static parse(args: Expression[], parsingContext: ParsingContext) {
    const op = args[0];
    if (args.length < 3) {
      // eslint-disable-next-line no-console
      console.error(
        `Error: expected at least 2 arguments for "${op}", but found only ${args.length -
          1}`,
      );

      return null;
    }

    const branches: any = [];
    for (let i = 1; i < args.length - 1; i++) {
      const test = parsingContext.parse(args[i], parsingContext);
      if (!test) {
        return null;
      }

      const result = parsingContext.parse(args[i + 1], parsingContext);
      if (!result) {
        return null;
      }

      branches.push([test, result]);
    }

    return new Any(branches);
  }

  evaluate(evaluationContext: EvaluationContext): any {
    for (const [test, expression] of this.branches) {
      if (test.evaluate(evaluationContext)) {
        return expression.evaluate(evaluationContext);
      }
    }

    return false;
  }
}

export default Any;
