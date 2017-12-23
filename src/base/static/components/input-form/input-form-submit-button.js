import React, { Component } from "react";

import SubmitField from "../form-fields/submit-field";
import PrimaryButton from "../ui-elements/primary-button";

class InputFormSubmitButton extends Component {

  render() {
    const { disabled, label, name } = this.props;

    return (
      <div className="input-form-submit-button">
        <PrimaryButton 
          className="input-form-submit-button__button"
          disabled={disabled}>
          {label}
          <SubmitField
            name={name}
            disabled={disabled}
            usageContext="PrimaryButton" 
          />
        </PrimaryButton>
      </div>
    );
  }

};

export default InputFormSubmitButton;
