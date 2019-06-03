import expressionRegistry from "./definitions";
import Expression from "./expression.tsx";

// ["==", ["get", "location_type"], "streets"]
// https://github.com/mapbox/mapbox-gl-js/blob/master/src/style-spec/expression/parsing_context.js

class EvaluationContext {
  place;
  dataset;
  key;
}

// A parsed expression, ready for evaluation against inputs.
class ParsedExpression {
  expression: Expression;
  evaluator;

  constructor(expression: Expression) {
    this.expression = expression;
    this.evaluator = new EvaluationContext();
  }

  evaluate({ place = {}, dataset = [], key }) {
    this.evaluator.place = place;
    this.evaluator.dataset = dataset;
    this.evaluator.key = key;

    return this.expression.evaluate(this.evaluator);
  }
}

class ParsingContext {
  parse(expr) {
    if (
      expr === null ||
      typeof expr === "string" ||
      typeof expr === "boolean" ||
      typeof expr === "number"
    ) {
      expr = ["literal", expr];
    }

    if (Array.isArray(expr)) {
      const op = expr[0];
      const Expr = expressionRegistry[op];

      if (Expr) {
        const parsed = Expr.parse(expr, this);
        if (!parsed) {
          return null;
        }

        return parsed;
      } else {
        // eslint-disable-next-line no-console
        console.error(`Unknown expression "${op}"`);
      }
    } else {
      // eslint-disable-next-line no-console
      console.error(`Expected an array, but found ${typeof expr} instead.`);
    }
  }
}

const makeParsedExpression = expression => {
  const parser = new ParsingContext();
  const parsed = parser.parse(expression);

  return new ParsedExpression(parsed);
};

export default makeParsedExpression;
