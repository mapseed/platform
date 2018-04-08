import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const CheckboxField = props => {
  const cn = classNames("checkbox-field", props.className);

  return (
    <input
      className={cn}
      type="checkbox"
      id={props.id}
      name={props.name}
      value={props.value}
      onChange={props.onChange}
      checked={props.checked}
    />
  );
};

CheckboxField.propTypes = {
  checked: PropTypes.bool.isRequired,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

export default CheckboxField;
