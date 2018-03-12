import React from "react";
import PropTypes from "prop-types";

const BigToggleFieldResponse = props => {
  return <p className="big-toggle-field-response">{props.label}</p>;
};

BigToggleFieldResponse.propTypes = {
  label: PropTypes.string.isRequired,
};

export default BigToggleFieldResponse;
