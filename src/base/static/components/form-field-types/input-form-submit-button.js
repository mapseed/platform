import React, { Component } from "react";
import PropTypes from "prop-types";

import "./input-form-submit-button.scss";

class InputFormSubmitButton extends Component {
  render() {
    return (
      <button className="input-form-submit-button" type="submit">
        {this.props.label}
      </button>
    );
  }
}

InputFormSubmitButton.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default InputFormSubmitButton;
