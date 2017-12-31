import React, { Component } from "react";
const cn = require("classnames");

import ToggleField from "../form-fields/toggle-field";
import "./big-toggle-field.scss";

class BigToggleField extends Component {

  render() {
    const { id, checked, labels, name, onChange, required, values } = this.props;
    const classNames = {
      label: cn("big-toggle-field__label", "big-toggle-field__label--hoverable", {
        "big-toggle-field__label--toggled": checked
      })
    };

    return (
      <div className="big-toggle-field">
        <ToggleField
          className="big-toggle-field__input"
          id={id}
          name={name}
          checked={checked}
          value={(checked) ? values[0] : values[1]}
          onChange={onChange}
          required={required} />
        <label
          className={classNames.label}
          htmlFor={id}>
          {(checked) ? labels[0] : labels[1]}
        </label>
      </div>
    );
  }
};

export default BigToggleField;
