import React from "react";
import PropTypes from "prop-types";

const BigToggleFieldResponse = props => {
  const label = props.value.selected
    ? props.value.selectedLabel
    : props.value.unselectedLabel;

  return <p className="big-toggle-field-response">{label}</p>;
};

BigToggleFieldResponse.propTypes = {
  value: PropTypes.object.isRequired,
};

export default BigToggleFieldResponse;
