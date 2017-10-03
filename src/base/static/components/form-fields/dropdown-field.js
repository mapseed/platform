import React, { Component } from "react";

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
    let selectedOption = this.props.options.filter((option) => {
      return option.selected === true;
    });

    return (
      <select
        className={baseClass}
        defaultValue={selectedOption.length > 0 && selectedOption[0].value}
        name={this.props.name}
        required={this.props.required}
        onChange={this.props.onChange}>

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
