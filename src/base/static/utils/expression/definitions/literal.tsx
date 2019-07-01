import { Expression } from "../expression";

const isLiteralValue = value => {
  if (
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    return true;
  }

  return false;
};

class Literal implements Expression {
  value: number | string | boolean;

  constructor(value) {
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
