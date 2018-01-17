import React, { Component } from "react";
const cn = require("classnames");

class RadioField extends Component {
  render() {
    const {
      checked,
      className,
      id,
      name,
      onChange,
      required,
      value,
    } = this.props;
    const classNames = cn("radio-field", className);

    return (
      <input
        className={classNames}
        type="radio"
        id={id}
        value={value}
        name={name}
        checked={checked}
        onChange={onChange}
        required={required}
      />
    );
  }
}

export default RadioField;
