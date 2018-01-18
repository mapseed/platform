import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import RadioField from "../form-fields/radio-field";
import "./big-radio-field.scss";

const BigRadioField = props => {
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
      "big-radio-field__label",
      "big-radio-field__label--hoverable",
      {
        "big-radio-field__label--toggled": checked,
        "big-radio-field__label--has-autofill--colored":
          hasAutofill && checked && autofillMode === "color",
      }
    ),
  };

  return (
    <div className="big-radio-field">
      <RadioField
        className="big-radio-field__input"
        id={id}
        name={name}
        checked={checked}
        value={value}
        onChange={onChange}
        required={required}
      />
      <label className={cn.label} htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

BigRadioField.propTypes = {
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

BigRadioField.defaultProps = {
  autofillMode: "color",
  hasAutofill: false,
};

export default BigRadioField;
