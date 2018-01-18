import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const RangeField = props => {
  const { className, id, max, min, name, onChange, required, value } = props;

  return (
    <input
      className={classNames("range-field", className)}
      type="range"
      min={min}
      max={max}
      id={id}
      name={name}
      value={value}
      required={required}
      onChange={onChange}
    />
  );
};

RangeField.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  max: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  value: PropTypes.number.isRequired,
};

RangeField.defaultProps = {
  min: 0,
  max: 100,
};

export default RangeField;
