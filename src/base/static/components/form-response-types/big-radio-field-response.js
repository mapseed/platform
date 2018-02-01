import React from "react";
import PropTypes from "prop-types";

import "./big-radio-field-response.scss";

const BigRadioFieldResponse = props => {
  return (
    <ul className="big-radio-field-response">
      {props.value
        .filter(response => response.selected)
        .map((response, i) => <li key={i}>{response.label}</li>)}
    </ul>
  );
};

BigRadioFieldResponse.propTypes = {
  value: PropTypes.array.isRequired,
};

export default BigRadioFieldResponse;
