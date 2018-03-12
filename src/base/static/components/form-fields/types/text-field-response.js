import React from "react";
import PropTypes from "prop-types";

const TextFieldResponse = props => {
  return <p className="text-field-response">{props.value}</p>;
};

TextFieldResponse.propTypes = {
  value: PropTypes.string.isRequired,
};

export default TextFieldResponse;
