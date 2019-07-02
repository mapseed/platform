import { Expression } from "../expression";

class Literal implements Expression {
  value: number | string | boolean;

  constructor(value: number | string | boolean) {
    this.value = value;
  }

  static parse(args) {
    if (args.length !== 2) {
      // eslint-disable-next-line no-console
      console.error(`Error: expected one argument for "literal"`);

      return null;
    }

    return new Literal(args[1]);
  }

  evaluate() {
    return this.value;
  }
}

export default Literal;
