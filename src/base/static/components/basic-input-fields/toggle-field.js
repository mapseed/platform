import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const ToggleField = props => {
  return (
    <input
      className={classNames("toggle-field", props.className)}
      type="checkbox"
      id={props.id}
      name={props.name}
      value={props.value}
      checked={props.checked}
      onChange={props.onChange}
    />
  );
};

ToggleField.propTypes = {
  checked: PropTypes.bool.isRequired,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

export default ToggleField;
