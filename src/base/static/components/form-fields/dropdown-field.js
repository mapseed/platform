import React, { Component } from "react";
const cn = require("classnames");

import { dropdownField as messages } from "../messages";
import "./dropdown-field.scss";

/*
  this.props.options should be an array of objects. Each object is as follows:
  {
    value: "option-value",
    label: "Option label",
    selected: true|false
  }
*/

class DropdownField extends Component {

  render() {
    const { autofillMode, hasAutofill, name, onChange, options, required, value } = this.props;
    const classNames = cn("dropdown-field", {
      "dropdown-field--has-autofill--colored": hasAutofill && autofillMode === "color",
      "dropdown-field--has-autofill--hidden": hasAutofill && autofillMode === "hide"
    })

    return (
      <select
        className={classNames}
        value={value}
        name={name}
        required={required}
        onChange={onChange}
      >
        <option value="">
          {messages.makeSelection}
        </option>
        {options.map((option) =>
          <option
            key={option.value}
            value={option.value}>
            {option.label}
          </option>
        )}
      </select>
    );
  }

};

export default DropdownField;
