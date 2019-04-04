import React from "react";
import PropTypes from "prop-types";

import { Paragraph } from "../../atoms/typography";

const Number = props => <Paragraph>{props.value}</Paragraph>;

Number.propTypes = {
  value: PropTypes.string.isRequired,
};

export default Number;
