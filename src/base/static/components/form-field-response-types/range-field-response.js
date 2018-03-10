import React from "react";
import PropTypes from "prop-types";

const RangeFieldResponse = props => {
  return <p className="range-field-response">{props.value}</p>;
};

RangeFieldResponse.propTypes = {
  value: PropTypes.string.isRequired,
};

export default RangeFieldResponse;
