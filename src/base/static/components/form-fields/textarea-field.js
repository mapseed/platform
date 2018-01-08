import React, { Component } from "react";
const cn = require("classnames");

import "./textarea-field.scss";

class TextareaField extends Component {

  render() {
    const { autofillMode, hasAutofill, name, onChange, placeholder, required, 
            value } = this.props;
    const classNames = cn("textarea-field", {
      "textarea-field--has-autofill--colored": hasAutofill && autofillMode === "color",
      "textarea-field--has-autofill--hidden": hasAutofill && autofillMode === "hide"
    });

    return (
      <textarea
        className={classNames}
        name={name}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={onChange}
      />
    );
  }

};

export default TextareaField;
