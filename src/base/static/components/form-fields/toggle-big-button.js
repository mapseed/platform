import React, { Component } from "react";

import { ToggleField } from "../form-fields/toggle-field";

const baseClass = "toggle-big-button";

class ToggleBigButton extends Component {

  render() {

    return (
      <div className={baseClass}>
        <ToggleField 
          id={this.props.id}
          name={this.props.name}
          checked={this.props.checked}
          value={(this.props.checked) ? this.props.values[0] : this.props.values[1]}
          onChange={this.props.onChange}
          required={this.props.required} />
        <label
          htmlFor={this.props.id}>
          {(this.props.checked) ? this.props.labels[0] : this.props.labels[1]}
        </label>
      </div>
    );
  }
};

export { ToggleBigButton };
