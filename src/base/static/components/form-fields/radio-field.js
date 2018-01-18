import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const RadioField = props => {
  const { checked, className, id, name, onChange, required, value } = props;

  return (
    <input
      className={classNames("radio-field", className)}
      type="radio"
      id={id}
      value={value}
      name={name}
      checked={checked}
      onChange={onChange}
      required={required}
    />
  );
};

RadioField.propTypes = {
  checked: PropTypes.bool.isRequired,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  value: PropTypes.string.isRequired,
};

export default RadioField;
