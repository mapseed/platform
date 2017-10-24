import React, { Component } from "react";

const baseClass = "mapseed-radio-field";

class RadioField extends Component {
  render() {
    return (
      <input 
        className={baseClass}
        type="radio"
        id={this.props.id}
        value={this.props.value}
        name={this.props.name}
        checked={this.props.checked}
        onChange={this.props.onChange}
        required={this.props.required} />
    );
  }
};

export { RadioField };
