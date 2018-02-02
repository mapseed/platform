import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import RadioField from "../form-field-types/radio-field";
import "./big-radio-field.scss";

const BigRadioField = props => {
  const cn = {
    label: classNames("big-radio-field__label", {
      "big-radio-field__label--toggled": props.checked,
      "big-radio-field__label--has-autofill--colored":
        props.hasAutofill && props.checked && props.autofillMode === "color",
    }),
  };

  return (
    <div className="big-radio-field">
      <RadioField
        className="big-radio-field__input"
        id={props.id}
        name={props.name}
        checked={props.checked}
        value={props.value}
        onChange={e => props.onChange(e.target.name, e.target.value)}
      />
      <label className={cn.label} htmlFor={props.id}>
        {props.label}
      </label>
    </div>
  );
};

BigRadioField.propTypes = {
  autofillMode: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  hasAutofill: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

BigRadioField.defaultProps = {
  autofillMode: "color",
  hasAutofill: false,
};

export default BigRadioField;
