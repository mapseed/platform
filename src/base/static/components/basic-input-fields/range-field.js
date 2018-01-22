import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const RangeField = props => {
  return (
    <input
      className={classNames("range-field", props.className)}
      type="range"
      min={props.min}
      max={props.max}
      id={props.id}
      name={props.name}
      value={props.value}
      onChange={e => props.onChange(e.target.name, e.target.value)}
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
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

RangeField.defaultProps = {
  min: 0,
  max: 100,
};

export default RangeField;
