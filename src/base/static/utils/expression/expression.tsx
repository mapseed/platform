export default interface Expression {
  parse(args: (string|number|boolean|Expression)[]): ?Expression;
  evaluate: any;
}
