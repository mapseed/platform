import React from "react";
import PropTypes from "prop-types";

import "./big-radio-field-response.scss";

const BigRadioFieldResponse = props => {
  return <p className="big-radio-field-response">{props.label}</p>;
};

BigRadioFieldResponse.propTypes = {
  label: PropTypes.string.isRequired,
};

export default BigRadioFieldResponse;
