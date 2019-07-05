/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import moment from "moment";
import PropTypes from "prop-types";

import { FontAwesomeIcon } from "../components/atoms/imagery";
import { Badge } from "../components/atoms/typography";

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

const numericFormatter = value => new Intl.NumberFormat("en-US").format(value);

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

const dateFormatter = value => moment(value).format("MMM Do, YYYY");

const BooleanIndicator = ({ color, outlineColor, faClassname }) => (
  <FontAwesomeIcon
    fontSize="1.6rem"
    faClassname={faClassname}
    color={color}
    textShadow={`-1px -1px 0 ${outlineColor}, 1px -1px 0 ${outlineColor}, -1px 1px 0 ${outlineColor}, 1px 1px 0 ${outlineColor}`}
    hoverColor={color}
  />
);

BooleanIndicator.propTypes = {
  color: PropTypes.string.isRequired,
  faClassname: PropTypes.string.isRequired,
  outlineColor: PropTypes.string.isRequired,
};

const booleanFormatter = value => {
  // TODO: Ideally we could be certain that boolean fields contain only
  // true/false values.
  if (["true", true, "yes"].includes(value)) {
    return (
      <BooleanIndicator
        faClassname="fa fa-check"
        color="#d5f0d0"
        outlineColor="#63e64c"
      />
    );
  } else if (["false", false, "no"].includes(value)) {
    return (
      <BooleanIndicator
        faClassname="fa fa-times"
        color="#fee0e3"
        outlineColor="#e66c7c"
      />
    );
  } else {
    return null;
  }
};

const badgeFormatter = value => {
  return (
    <Badge
      css={css`
        display: inline;
      `}
      color={value.color}
    >
      {value.label}
    </Badge>
  );
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
    case "tooltip-default":
      return defaultTooltipFormatter;
    case "numeric":
      return numericFormatter;
    case "date":
      return dateFormatter;
    case "boolean":
      return booleanFormatter;
    case "badge":
      return badgeFormatter;
    default:
      return defaultFormatter;
  }
};

const isEmailAddress = text => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return emailRegex.test(String(text).toLowerCase());
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

  if (typeof response === "number") {
    return response;
  }

  const match = /([0-9,.]+)/.exec(response.trim());
  if (!match) {
    return null;
  } else {
    return Number(match[1].replace(",", ""));
  }
};

export { COLORS, BLUE, getFormatter, getNumericalPart, isEmailAddress };
