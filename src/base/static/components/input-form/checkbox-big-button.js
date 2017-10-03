import React, { Component } from "react";

import { CheckboxField } from "../form-fields/checkbox-field";

const baseClass = "checkbox-big-button";

class CheckboxBigButton extends Component {
  render() {
    return (
      <div className={baseClass}>
        <CheckboxField 
          id={this.props.id}
          name={this.props.name}
          defaultChecked={this.props.defaultChecked}
          required={this.props.required}>
        </CheckboxField>
        <label
          htmlFor={this.props.id}>
          {this.props.label}
        </label>
      </div>
    );
  }
};

export { CheckboxBigButton };
