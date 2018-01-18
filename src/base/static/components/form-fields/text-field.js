import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./text-field.scss";

const TextField = props => {
  const {
    autofillMode,
    hasAutofill,
    name,
    onChange,
    placeholder,
    required,
    value,
  } = props;
  const cn = classNames("text-field", {
    "text-field--has-autofill--colored":
      hasAutofill && autofillMode === "color",
    "text-field--has-autofill--hidden": hasAutofill && autofillMode === "hide",
  });

  return (
    <input
      className={cn}
      name={name}
      type="text"
      value={value}
      placeholder={placeholder}
      required={required}
      onChange={onChange}
    />
  );
};

TextField.propTypes = {
  autofillMode: PropTypes.string.isRequired,
  hasAutofill: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.string,
  value: PropTypes.string,
};

TextField.defaultProps = {
  autofillMode: "color",
};

export default TextField;
