import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const CheckboxField = props => {
  const { checked, className, id, name, onChange, value } = props;
  const cn = classNames("checkbox-field", className);

  return (
    <input
      className={cn}
      type="checkbox"
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      checked={checked}
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
