import React, { Component } from "react";

import { dropdownField as messages } from "../messages";

const baseClass = "mapseed-dropdown-field";

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

    return (
      <select
        className={baseClass}
        value={this.props.value}
        name={this.props.name}
        required={this.props.required}
        onChange={this.props.onChange}>
        <option value="">
          {messages.makeSelection}
        </option>
        {this.props.options.map((option) => 
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

export { DropdownField };
