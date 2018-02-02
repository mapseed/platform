import React, { Component } from "react";
import PropTypes from "prop-types";

import SubmitField from "../form-field-types/submit-field";
import PrimaryButton from "../ui-elements/primary-button";

class InputFormSubmitButton extends Component {
  render() {
    return (
      <div className="input-form-submit-button">
        <PrimaryButton
          className="input-form-submit-button__button"
          disabled={this.props.disabled}
        >
          {this.props.label}
          <SubmitField
            name={this.props.name}
            disabled={this.props.disabled}
            usageContext="PrimaryButton"
          />
        </PrimaryButton>
      </div>
    );
  }
}

InputFormSubmitButton.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default InputFormSubmitButton;
