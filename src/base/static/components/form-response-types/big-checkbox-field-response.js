import React from "react";
import PropTypes from "prop-types";

import "./big-checkbox-field-response.scss";

const BigCheckboxFieldResponse = props => {
  return (
    <ul className="big-checkbox-field-response">
      {props.value
        .filter(response => response.selected)
        .map((response, i) => <li key={i}>{response.label}</li>)}
    </ul>
  );
};

BigCheckboxFieldResponse.propTypes = {
  value: PropTypes.array.isRequired,
};

export default BigCheckboxFieldResponse;
