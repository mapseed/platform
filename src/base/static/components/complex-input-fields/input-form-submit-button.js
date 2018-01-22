import React, { Component } from "react";

import SubmitField from "../basic-input-fields/submit-field";
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

export default InputFormSubmitButton;
