import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withTranslation } from "react-i18next";

import RadioField from "./radio-field";
import "./big-radio-field.scss";

import { isTouchDevice } from "../../../utils/misc-utils";

const BigRadioField = props => {
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
      <label
        className={classNames("big-radio-field__label", {
          "big-radio-field__label--hoverable": !isTouchDevice,
          "big-radio-field__label--toggled": props.checked,
          "big-radio-field__label--has-autofill":
            props.hasAutofill && props.checked,
        })}
        htmlFor={props.id}
      >
        {props.t(
          `radioFieldLabel${props.formId}${props.name}${props.id}`,
          props.label,
        )}
      </label>
    </div>
  );
};

BigRadioField.propTypes = {
  checked: PropTypes.bool.isRequired,
  formId: PropTypes.string.isRequired,
  hasAutofill: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

BigRadioField.defaultProps = {
  hasAutofill: false,
};

export default withTranslation("BigRadioField")(BigRadioField);
