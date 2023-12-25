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
        `Error: expected at least 2 arguments for "${op}", but found only ${
          args.length - 1
        }`,
      );

      return null;
    }

    const branches: any = [];
    for (let i = 1; i < args.length; i++) {
      const condition = parsingContext.parse(args[i], parsingContext);
      if (!condition) {
        return null;
      }

      branches.push(condition);
    }

    return new Any(branches);
  }

  evaluate(evaluationContext: EvaluationContext): any {
    for (const branch of this.branches) {
      if (branch.evaluate(evaluationContext)) {
        return true;
      }
    }

    return false;
  }
}

export default Any;
