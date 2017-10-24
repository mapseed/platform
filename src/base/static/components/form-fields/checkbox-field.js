import React, { Component } from "react";

const baseClass = "mapseed-checkbox-field";

class CheckboxField extends Component {

  render() {
    return (
      <input 
        className={baseClass}
        type="checkbox"
        id={this.props.id}
        name={this.props.name}
        value={this.props.value}
        required={this.props.required} 
        onChange={this.props.onChange}
        checked={this.props.checked} />
    );
  }
};

export { CheckboxField };
