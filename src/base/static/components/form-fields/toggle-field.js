import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const ToggleField = props => {
  const { checked, className, id, name, onChange, required, value } = props;

  return (
    <input
      className={classNames("toggle-field", className)}
      type="checkbox"
      id={id}
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      required={required}
    />
  );
};

ToggleField.propTypes = {
  checked: PropTypes.bool.isRequired,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.string,
  value: PropTypes.string.isRequired,
};

export default ToggleField;
