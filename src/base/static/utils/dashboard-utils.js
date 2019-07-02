// These are the colors we use for our charts:
const BLUE = "#377eb8";
const COLORS = [
  "#e41a1c",
  "#4daf4a",
  "#984ea3",
  "#ff7f00",
  "#ffff33",
  BLUE,
  "#a65628",
  "#f781bf",
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const truncatedTextFormatter = length => {
  return text => {
    if (text.length > length) {
      return `${text.slice(0, length)}…`;
    } else {
      return text;
    }
  };
};

const countFormatter = (value, name, props) => {
  return props.payload.value;
};

const countPercentFormatter = (value, name, props) => {
  return `${props.payload.value} (${(
    (props.payload.value / props.payload.totalPlaces) *
    100
  ).toFixed(0)}%)`;
};

const tooltipCurrencyFormatter = () => {};

const getFormatter = format => {
  switch (format) {
    case "currency":
      return currencyFormatter;
    case "truncated":
      return truncatedTextFormatter;
    case "count-percent":
      return countPercentFormatter;
    case "count":
      return countFormatter;
    default:
      return null;
  }
};

// Attempt to strip out just the continguous numerical portion of a free-text
// response, so we can use it to perform an aggregation, like a sum.
// For example, if responses are in the form `$1,234.03`, we would convert that
// to `1234.03`.
const getNumericalPart = response => {
  if (typeof response !== "number" && typeof response !== "string") {
    // Don't attempt to pull a number out of arrays, objects, or booleans.
    return 0;
  }

  const match = /([0-9,.]+)/.exec(response.trim());
  if (!match) {
    return 0;
  } else {
    return Number(match[1].replace(",", ""));
  }
};

export { COLORS, BLUE, getFormatter, getNumericalPart };
