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

export { CheckboxInput, DatetimeInput };
