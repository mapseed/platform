import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { NumberInput } from "../../atoms/input";

const NumberField = styled(NumberInput)(props => ({
  border: props.theme.input.border,
  padding: props.theme.input.padding,
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: props.hasAutofill
    ? props.theme.input.autofillBgColor
    : props.theme.input.defaultBgColor,
}));

export default NumberField;
