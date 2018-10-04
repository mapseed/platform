import React from "react";
import PropTypes from "prop-types";

import { Paragraph } from "../../atoms/typography";

const NumberFieldResponse = props => <Paragraph>{props.value}</Paragraph>;

NumberFieldResponse.propTypes = {
  value: PropTypes.string.isRequired,
};

export default NumberFieldResponse;
