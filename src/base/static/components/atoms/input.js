import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const CheckboxInput = props => {
  return (
    <input
      className={classNames("checkbox-input", props.classes)}
      type="checkbox"
      id={props.id}
      name={props.name}
      onChange={props.onChange}
      checked={props.checked}
    />
  );
};

CheckboxInput.propTypes = {
  checked: PropTypes.bool.isRequired,
  classes: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

const NumberInput = props => {
  return (
    <input
      className={props.className}
      name={props.name}
      type="number"
      value={props.value}
      placeholder={props.placeholder}
      onChange={e => props.onChange(e.target.name, e.target.value)}
    />
  );
};

NumberInput.propTypes = {
  className: PropTypes.string,
  hasAutofill: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
};

const DatetimeInput = props => {
  return (
    <input
      className={classNames("datetime-input", props.classes)}
      type="text"
      ref={props.childRef}
      value={props.value}
      placeholder={props.placeholder}
      onFocus={props.onFocus}
    />
  );
};

DatetimeInput.propTypes = {
  childRef: PropTypes.func,
  classes: PropTypes.string,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string,
};

export { CheckboxInput, DatetimeInput, NumberInput };
