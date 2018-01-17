import React, { Component } from "react";
const cn = require("classnames");

import "./text-field.scss";

class TextField extends Component {
  render() {
    const {
      autofillMode,
      hasAutofill,
      name,
      onChange,
      placeholder,
      required,
      value,
    } = this.props;
    const classNames = cn("text-field", {
      "text-field--has-autofill--colored":
        hasAutofill && autofillMode === "color",
      "text-field--has-autofill--hidden":
        hasAutofill && autofillMode === "hide",
    });

    return (
      <input
        className={classNames}
        name={name}
        type="text"
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
      />
    );
  }
}

export default TextField;
