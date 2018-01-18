import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { dropdownField as messages } from "../messages";
import "./dropdown-field.scss";

const DropdownField = props => {
  const {
    autofillMode,
    hasAutofill,
    name,
    onChange,
    options,
    required,
    value,
  } = props;
  const cn = classNames("dropdown-field", {
    "dropdown-field--has-autofill--colored":
      hasAutofill && autofillMode === "color",
  });

  return (
    <select
      className={cn}
      value={value}
      name={name}
      required={required}
      onChange={onChange}
    >
      <option value="">{messages.makeSelection}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

DropdownField.propTypes = {
  autofillMode: PropTypes.string.isRequired,
  hasAutofill: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      selected: PropTypes.bool,
    })
  ).isRequired,
  value: PropTypes.string.isRequired,
};

DropdownField.defaultProps = {
  autofillMode: "color",
};

export default DropdownField;
