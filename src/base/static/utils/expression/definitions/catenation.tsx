import { Expression, EvaluationContext, ParsingContext } from "../parse";

const OPERANDS_SLICE_INDICES = {
  cat: 1,
  "cat-join": 2,
};

const makeCat = (op: string) => {
  return class Cat implements Expression {
    operands: any;
    joinString: string | null;
    type: string;

    constructor(joinString: string | null, operands: any) {
      this.operands = operands;
      this.joinString = joinString;
      this.type = op;
    }

    static parse(args: any, parsingContext: ParsingContext) {
      if (op === "cat-join" && typeof args[1] !== "string") {
        // eslint-disable-next-line no-console
        console.error(
          `Error: expected second argument to be a join string for "${op}"`,
        );

        return null;
      }

      const operands = args
        .slice(OPERANDS_SLICE_INDICES[op])
        .map(operand => parsingContext.parse(operand, parsingContext));

      if (op === "cat-join") {
        return new Cat(args[1], operands);
      }

      return new Cat(null, operands);
    }

    evaluate(evaluationContext: EvaluationContext) {
      const catResult = this.operands.reduce((result, operand) => {
        const val = operand.evaluate(evaluationContext);

        return val ? [...result, val] : result;
      }, []);

      return op === "cat-join" ? catResult.join(this.joinString) : catResult;
    }
  };
};

export const Cat = makeCat("cat");
export const CatJoin = makeCat("cat-join");
