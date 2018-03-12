import React from "react";
import PropTypes from "prop-types";

const TextareaFieldResponse = props => {
  return <p className="textarea-field-response">{props.value}</p>;
};

TextareaFieldResponse.propTypes = {
  value: PropTypes.string.isRequired,
};

export default TextareaFieldResponse;
