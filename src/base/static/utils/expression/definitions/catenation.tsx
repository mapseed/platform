import Expression from "../expression";

class Cat implements Expression {
  operands;

  constructor(operands) {
    this.operands = operands;
  }

  static parse(args, parsingContext) {
    const operands = args
      .slice(1)
      .map(operand => parsingContext.parse(operand));

    return new Cat(operands);
  }

  evaluate(evaluationContext: EvaluationContext) {
    return this.operands.map(operand => operand.evaluate(evaluationContext));
  }
}

export default Cat;
