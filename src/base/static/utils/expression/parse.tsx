import PropTypes from "prop-types";

import { placePropType } from "../../state/ducks/places";
import expressionRegistry from "./definitions";
import {
  Expression,
  IEvaluationContext,
  IParsingContext,
  IParsedExpression,
} from "./expression";

type Place = PropTypes.InferProps<typeof placePropType>;

class EvaluationContext implements IEvaluationContext {
  place;
  dataset;
  widgetState;

  setPlace(place: Place) {
    this.place = place;
  }

  setDataset(dataset: Place[]) {
    this.dataset = dataset;
  }

  setWidgetState(widgetState: any) {
    this.widgetState = widgetState;
  }
}

// A parsed expression, ready for evaluation against inputs.
class ParsedExpression implements IParsedExpression {
  expression;
  evaluator;

  constructor(expression: Expression) {
    this.expression = expression;
    this.evaluator = new EvaluationContext();
  }

  evaluate({
    place,
    dataset,
    widgetState,
  }: {
    place?: Place;
    dataset?: Place[];
    widgetState?: any;
  }) {
    this.evaluator.setPlace(place);
    this.evaluator.setDataset(dataset);
    this.evaluator.setWidgetState(widgetState);

    return this.expression.evaluate(this.evaluator);
  }
}

class ParsingContext implements IParsingContext {
  parse(expr: any): IParsedExpression | null {
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

        return null;
      }
    } else {
      // eslint-disable-next-line no-console
      console.error(`Expected an array, but found ${typeof expr} instead.`);

      return null;
    }
  }
}

const makeParsedExpression = expression => {
  const parser = new ParsingContext();
  const parsed = parser.parse(expression);

  if (parsed) {
    return new ParsedExpression(parsed);
  } else {
    // eslint-disable-next-line no-console
    console.error(`Unable to make parsed expression from ${expression}`);

    return null;
  }
};

export default makeParsedExpression;
