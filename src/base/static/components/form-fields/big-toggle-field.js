import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import ToggleField from "../form-fields/toggle-field";
import "./big-toggle-field.scss";

const BigToggleField = props => {
  const {
    autofillMode,
    hasAutofill,
    id,
    checked,
    labels,
    name,
    onChange,
    required,
    values,
  } = props;
  const cn = {
    label: classNames(
      "big-toggle-field__label",
      "big-toggle-field__label--hoverable",
      {
        "big-toggle-field__label--toggled": checked,
        "big-toggle-field__label--has-autofill--colored":
          hasAutofill && autofillMode === "color",
      }
    ),
  };

  return (
    <div className="big-toggle-field">
      <ToggleField
        className="big-toggle-field__input"
        id={id}
        name={name}
        checked={checked}
        value={checked ? values[0] : values[1]}
        onChange={onChange}
        required={required}
      />
      <label className={cn.label} htmlFor={id}>
        {checked ? labels[0] : labels[1]}
      </label>
    </div>
  );
};

BigToggleField.propTypes = {
  checked: PropTypes.bool.isRequired,
  hasAutofill: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
};

BigToggleField.defaultProps = {
  autofillMode: "color",
};

export default BigToggleField;
