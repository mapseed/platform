import React from "react";
import PropTypes from "prop-types";

import "./input-form-submit-button.scss";

const InputFormSubmitButton = props => {
  return (
    <button
      name={props.name}
      disabled={props.disabled}
      className="input-form-submit-button"
      type="button"
      onClick={props.onClickSubmit}
    >
      {props.label}
    </button>
  );
};

InputFormSubmitButton.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onClickSubmit: PropTypes.func.isRequired,
};

export default InputFormSubmitButton;
