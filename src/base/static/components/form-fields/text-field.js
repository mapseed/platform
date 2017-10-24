import React, { Component } from "react";
import cx from "bem-classnames";

const baseClass = "mapseed-text-field";

class TextField extends Component {

  constructor() {
    super();

    this.classes = {
      baseClass: {
        name: baseClass,
        modifiers: ["autofill"]
      }
    };
  }

  render() {
    return (
      <input 
        className={cx(this.classes.baseClass, { autofill: (this.props.hasAutofill) ? "has-autofill" : "" })}
        name={this.props.name}
        type="text"
        value={this.props.value}
        placeholder={this.props.placeholder} 
        required={this.props.required} 
        onChange={this.props.onChange} />
    );
  }
};

export { TextField };
