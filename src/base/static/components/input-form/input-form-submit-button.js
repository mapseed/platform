import React, { Component } from "react";

import { SubmitField } from "../form-fields/submit-field";
import { PrimaryButton } from "../ui-elements/primary-button";

const baseClass = "input-form-submit-button";

class InputFormSubmitButton extends Component {

  render() {
    return (
      <div className={baseClass}>
        <PrimaryButton>
          {this.props.label}
          <SubmitField name={this.props.name} />
        </PrimaryButton>
      </div>
    );
  }
};

export { InputFormSubmitButton };
