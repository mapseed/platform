import React from "react";
import PropTypes from "prop-types";

import "./big-checkbox-field-response.scss";

const BigCheckboxFieldResponse = props => {
  return (
    <ul className="big-checkbox-field-response">
      {props.labels.map((label, i) => (
        <li key={i}>{label}</li>
      ))}
    </ul>
  );
};

BigCheckboxFieldResponse.propTypes = {
  labels: PropTypes.array.isRequired,
};

export default BigCheckboxFieldResponse;
