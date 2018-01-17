import React, { Component } from "react";
const cn = require("classnames");

class CheckboxField extends Component {
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
    const classNames = cn("checkbox-field", className);

    return (
      <input
        className={classNames}
        type="checkbox"
        id={id}
        name={name}
        value={value}
        required={required}
        onChange={onChange}
        checked={checked}
      />
    );
  }
}

export default CheckboxField;
