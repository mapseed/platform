import React, { Component } from "react";

import { ToggleField } from "../form-fields/toggle-field";

const baseClass = "toggle-big-button";

class ToggleBigButton extends Component {

  constructor() {
    super(...arguments);
    this.state = {
      checked: this.props.checked
    }
  }

  onChange(evt) {
    this.props.onChange(evt);
    this.setState({ checked: evt.target.checked });
  }

  render() {
    return (
      <div className={baseClass}>
        <ToggleField 
          id={this.props.id}
          name={this.props.name}
          checked={this.state.checked}
          onChange={this.onChange.bind(this)}
          required={this.props.required} />
        <label
          htmlFor={this.props.id}>
          {(this.state.checked) ? this.props.labels[0] : this.props.labels[1]}
        </label>
      </div>
    );
  }
};

ToggleBigButton.defaultProps = {
  checked: false
};

export { ToggleBigButton };
