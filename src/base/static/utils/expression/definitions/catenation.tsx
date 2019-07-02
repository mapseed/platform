import { Expression, IEvaluationContext, IParsingContext } from "../expression";

class Cat implements Expression {
  operands: any;

  constructor(operands: any) {
    this.operands = operands;
  }

  static parse(args: any, parsingContext: IParsingContext) {
    const operands = args
      .slice(1)
      .map(operand => parsingContext.parse(operand));

    return new Cat(operands);
  }

  evaluate(evaluationContext: IEvaluationContext) {
    return this.operands.map(operand => operand.evaluate(evaluationContext));
  }
}

export default Cat;
