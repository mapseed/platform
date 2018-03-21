import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { dropdownField as messages } from "../../../messages";
import "./dropdown-field.scss";

const DropdownField = props => {
  const cn = classNames("dropdown-field", {
    "dropdown-field--has-autofill": props.hasAutofill,
  });

  return (
    <select
      className={cn}
      value={props.value}
      name={props.name}
      onChange={e => props.onChange(e.target.name, e.target.value)}
    >
      <option value="">{messages.makeSelection}</option>
      {props.options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

DropdownField.propTypes = {
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
  hasAutofill: false,
};

export default DropdownField;
