import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { translate } from "react-i18next";

import ToggleField from "./toggle-field";
import "./big-toggle-field.scss";

import { isTouchDevice } from "../../../utils/misc-utils";

const BigToggleField = props => {
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
      <label
        className={classNames("big-toggle-field__label", {
          "big-toggle-field__label--hoverable": !isTouchDevice,
          "big-toggle-field__label--toggled": props.checked,
          "big-toggle-field__label--has-autofill": props.hasAutofill,
        })}
        htmlFor={props.id}
      >
        {props.checked
          ? props.t(
              `toggleFieldLabelChecked${props.formId}${props.name}`,
              props.labels[0],
            )
          : props.t(
              `toggleFieldLabelUnchecked${props.formId}${props.name}`,
              props.labels[1],
            )}
      </label>
    </div>
  );
};

BigToggleField.propTypes = {
  checked: PropTypes.bool.isRequired,
  formId: PropTypes.string.isRequired,
  hasAutofill: PropTypes.bool,
  id: PropTypes.string.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default translate("BigToggleField")(BigToggleField);
