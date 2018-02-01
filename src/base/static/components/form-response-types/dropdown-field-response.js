import React from "react";
import PropTypes from "prop-types";

const DropdownFieldResponse = props => {
  return props.value
    .filter(response => response.selected)
    .map((response, i) => <p key={i}>{response.label}</p>);
};

DropdownFieldResponse.propTypes = {
  value: PropTypes.array.isRequired,
};

export default DropdownFieldResponse;
