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

const currencyFormatter = value =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);

const tooltipCurrencyFormatter = (value, name, props) => {
  return currencyFormatter(props.payload.value);
};

const truncatedTextFormatter = length => {
  return text => {
    if (text.length > length) {
      return `${text.slice(0, length)}…`;
    } else {
      return text;
    }
  };
};

const defaultFormatter = value => value;

const defaultTooltipFormatter = (value, name, props) => {
  return props.payload.value;
};

const tooltipCountPercentFormatter = (value, name, props) => {
  return countPercentFormatter(props.payload.value, props.payload.totalPlaces);
};

const countPercentFormatter = (count, totalCount) => {
  return `${count} (${((count / totalCount) * 100).toFixed(0)}%)`;
};

const getFormatter = format => {
  switch (format) {
    case "currency":
      return currencyFormatter;
    case "tooltip-currency":
      return tooltipCurrencyFormatter;
    case "truncated":
      return truncatedTextFormatter;
    case "count-percent":
      return countPercentFormatter;
    case "tooltip-count-percent":
      return tooltipCountPercentFormatter;
    case "count":
      return defaultFormatter;
    case "tooltip-count":
      return defaultTooltipFormatter;
    case "tooltip-default":
      return defaultTooltipFormatter;
    default:
      return defaultFormatter;
  }
};

// Attempt to strip out just the continguous numerical portion of a free-text
// response, so we can use it to perform an aggregation, like a sum.
// For example, if responses are in the form `$1,234.03`, we would convert that
// to `1234.03`.
const getNumericalPart = response => {
  if (typeof response !== "number" && typeof response !== "string") {
    // Don't attempt to pull a number out of arrays, objects, or booleans.
    return null;
  }

  const match = /([0-9,.]+)/.exec(response.trim());
  if (!match) {
    return null;
  } else {
    return Number(match[1].replace(",", ""));
  }
};

export { COLORS, BLUE, getFormatter, getNumericalPart };
