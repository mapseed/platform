import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import ToggleField from "../form-field-types/toggle-field";
import "./big-toggle-field.scss";

const BigToggleField = props => {
  const cn = {
    label: classNames("big-toggle-field__label", {
      "big-toggle-field__label--toggled": props.checked,
      "big-toggle-field__label--has-autofill": props.hasAutofill,
    }),
  };

  return (
    <div className="big-toggle-field">
      <ToggleField
        className="big-toggle-field__input"
        id={props.id}
        name={props.name}
        checked={props.checked}
        value={props.checked ? props.values[0] : props.values[1]}
        onChange={e =>
          props.onChange(e.target.name, props.values[e.target.checked ? 0 : 1])
        }
      />
      <label className={cn.label} htmlFor={props.id}>
        {props.checked ? props.labels[0] : props.labels[1]}
      </label>
    </div>
  );
};

BigToggleField.propTypes = {
  checked: PropTypes.bool.isRequired,
  hasAutofill: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default BigToggleField;
