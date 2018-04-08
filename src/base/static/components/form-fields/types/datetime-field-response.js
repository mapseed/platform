import React from "react";
import PropTypes from "prop-types";

const DatetimeFieldResponse = props => {
  return <p>{props.value}</p>;
};

DatetimeFieldResponse.propTypes = {
  value: PropTypes.string.isRequired,
};

export default DatetimeFieldResponse;
