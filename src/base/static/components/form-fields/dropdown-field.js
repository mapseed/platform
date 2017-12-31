import React, { Component } from "react";

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
    const { name, onChange, options, required, value } = this.props;

    return (
      <select
        className="dropdown-field"
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
