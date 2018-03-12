import React from "react";
import PropTypes from "prop-types";

const DropdownFieldResponse = props => {
  return <p className="dropdown-field-response">{props.label}</p>;
};

DropdownFieldResponse.propTypes = {
  label: PropTypes.string.isRequired,
};

export default DropdownFieldResponse;
