import { Expression, IEvaluationContext, IParsingContext } from "../expression";

class Cat implements Expression {
  operands: any;

  constructor(operands: any) {
    this.operands = operands;
  }

  static parse(args: any, parsingContext: IParsingContext) {
    const operands = args
      .slice(1)
      .map(operand => parsingContext.parse(operand, parsingContext));

    return new Cat(operands);
  }

  evaluate(evaluationContext: IEvaluationContext) {
    return this.operands.reduce((result, operand) => {
      const val = operand.evaluate(evaluationContext);

      return val ? [...result, val] : result;
    }, []);
  }
}

export default Cat;
