import PropTypes from "prop-types";

import { placePropType } from "../../state/ducks/places";

export interface Expression {
  property?: string;
  evaluate: (
    evaluationContext: IEvaluationContext,
  ) => number | string | boolean | Expression;
}

type Place = PropTypes.InferProps<typeof placePropType>;

export interface IEvaluationContext {
  place?: Place;
  dataset?: Place[];
}

export interface IParsingContext {
  parse: (expr: any) => Expression | null;
}

export interface IParsedExpression {
  expression: Expression;
  evaluator: IEvaluationContext;
  evaluate: (
    { place, dataset }: { place?: Place; dataset?: Place[] },
  ) => string | number | boolean;
}
