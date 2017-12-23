import React, { Component } from "react";
const cn = require("classnames");

import CheckboxField from "../form-fields/checkbox-field";
import "./big-checkbox-field.scss";

class BigCheckboxField extends Component {

  render() {

    const { checked, id, label, name, onChange, required, value } = this.props;
    const classNames = {
      label: cn("big-checkbox-field__label", "big-checkbox-field__label--hoverable", {
        "big-checkbox-field__label--toggled": checked
      })
    };

    return (
      <div className="big-checkbox-field">
        <CheckboxField
          className="big-checkbox-field__input"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          required={required}>
        </CheckboxField>
        <label
          className={classNames.label}
          htmlFor={id}>
          {label}
        </label>
      </div>
    );
  }

};

export default BigCheckboxField;
