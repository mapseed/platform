import React, { Component } from "react";

const baseClass = "mapseed-toggle-field";

class ToggleField extends Component {

  constructor() {
    super(...arguments);
    this.state = {
      checked: this.props.checked
    }
  }

  onChange(evt) {
    this.setState({ checked: !this.state.checked });
    this.props.onChange(evt);
  }

  render() {
    return (
      <input 
        className={baseClass}
        type="checkbox"
        id={this.props.id}
        name={this.props.name}
        checked={this.state.checked}
        onChange={this.onChange.bind(this)}
        required={this.props.required} />
    );
  }
};

ToggleField.defaultProps = {
  checked: false
};

export { ToggleField };
