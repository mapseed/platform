import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./textarea-field.scss";

const TextareaField = props => {
  const {
    autofillMode,
    hasAutofill,
    name,
    onChange,
    placeholder,
    required,
    value,
  } = props;
  const cn = classNames("textarea-field", {
    "textarea-field--has-autofill--colored":
      hasAutofill && autofillMode === "color",
  });

  return (
    <textarea
      className={cn}
      name={name}
      placeholder={placeholder}
      value={value}
      required={required}
      onChange={onChange}
    />
  );
};

TextareaField.propTypes = {
  autofillMode: PropTypes.string.isRequired,
  hasAutofill: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.string,
  value: PropTypes.string,
};

TextareaField.defaultProps = {
  autofillMode: "color",
};

export default TextareaField;
