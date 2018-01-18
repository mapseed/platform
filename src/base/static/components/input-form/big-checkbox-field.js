import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import CheckboxField from "../form-fields/checkbox-field";
import "./big-checkbox-field.scss";

const BigCheckboxField = props => {
  const {
    autofillMode,
    checked,
    hasAutofill,
    id,
    label,
    name,
    onChange,
    required,
    value,
  } = props;
  const cn = {
    label: classNames(
      "big-checkbox-field__label",
      "big-checkbox-field__label--hoverable",
      {
        "big-checkbox-field__label--toggled": checked,
        "big-checkbox-field__label--has-autofill--colored":
          hasAutofill && checked && autofillMode === "color",
      }
    ),
  };

  return (
    <div className="big-checkbox-field">
      <CheckboxField
        className="big-checkbox-field__input"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        required={required}
      />
      <label className={cn.label} htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

BigCheckboxField.propTypes = {
  autofillMode: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  hasAutofill: PropTypes.bool.isRequired,
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  value: PropTypes.string.isRequired,
};

BigCheckboxField.defaultProps = {
  autofillMode: "color",
  hasAutofill: false,
};

export default BigCheckboxField;
