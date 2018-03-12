import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const RadioField = props => {
  return (
    <input
      className={classNames("radio-field", props.className)}
      type="radio"
      id={props.id}
      value={props.value}
      name={props.name}
      checked={props.checked}
      onChange={props.onChange}
    />
  );
};

RadioField.propTypes = {
  checked: PropTypes.bool.isRequired,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

export default RadioField;
