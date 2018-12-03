import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { NumberInput } from "../../atoms/input";

const NumberField = styled(NumberInput)(props => ({
  borderColor: props.theme.brand.tertiary,
  borderWidth: "4px",
  borderStyle: "solid",
  padding: "0.5rem",
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: props.hasAutofill
    ? props.theme.input.autofillBgColor
    : props.theme.input.defaultBgColor,
}));

export default NumberField;
