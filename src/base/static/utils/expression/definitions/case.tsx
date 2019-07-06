import {
  Expression,
  IEvaluationContext,
  IParsingContext,
  IParsedExpression,
} from "../expression";

class Case implements Expression {
  branches;
  otherwise;

  constructor(branches: Expression[], otherwise: Expression) {
    this.branches = branches;
    this.otherwise = otherwise;
  }

  static parse(args: (Expression)[], parsingContext: IParsingContext) {
    const op = args[0];
    if (args.length < 4) {
      // eslint-disable-next-line no-console
      console.error(
        `Error: expected at least 3 arguments for "${op}", but found only ${args.length -
          1}`,
      );

      return null;
    } else if (args.length % 2 !== 0) {
      // eslint-disable-next-line no-console
      console.error(`Error: expected an odd number of arguments for "${op}"`);

      return null;
    }

    const branches: any = [];
    for (let i = 1; i < args.length - 1; i += 2) {
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

    const otherwise = parsingContext.parse(
      args[args.length - 1],
      parsingContext,
    );
    if (!otherwise) {
      return null;
    }

    return new Case(branches, otherwise);
  }

  evaluate(evaluationContext: IEvaluationContext): any {
    for (const [test, expression] of this.branches) {
      if (test.evaluate(evaluationContext)) {
        return expression.evaluate(evaluationContext);
      }
    }

    return this.otherwise.evaluate(evaluationContext);
  }
}

export default Case;
