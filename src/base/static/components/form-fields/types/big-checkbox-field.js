import React, { Component } from "react";
import { List } from "immutable";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withTranslation } from "react-i18next";

import CheckboxField from "./checkbox-field";
import "./big-checkbox-field.scss";

import { isTouchDevice } from "../../../utils/misc-utils";

class BigCheckboxField extends Component {
  onChange(evt) {
    const idx = this.props.checkboxGroupState.indexOf(evt.target.value);
    const newCheckboxGroupState = evt.target.checked
      ? this.props.checkboxGroupState.push(evt.target.value)
      : this.props.checkboxGroupState.delete(idx);

    this.props.onChange(evt.target.name, newCheckboxGroupState);
  }

  render() {
    const isChecked = this.props.checkboxGroupState.includes(this.props.value);

    return (
      <div className="big-checkbox-field">
        <CheckboxField
          className="big-checkbox-field__input"
          id={this.props.id}
          name={this.props.name}
          value={this.props.value}
          checked={isChecked}
          onChange={this.onChange.bind(this)}
        />
        <label
          className={classNames("big-checkbox-field__label", {
            "big-checkbox-field__label--hoverable": !isTouchDevice,
            "big-checkbox-field__label--toggled": isChecked,
            "big-checkbox-field__label--has-autofill":
              this.props.hasAutofill && isChecked,
          })}
          htmlFor={this.props.id}
        >
          {this.props.t(
            `checkboxFieldPlaceholder${this.props.formId}${this.props.name}${this.props.id}`,
            this.props.label,
          )}
        </label>
      </div>
    );
  }
}

BigCheckboxField.propTypes = {
  checkboxGroupState: PropTypes.oneOfType([
    PropTypes.instanceOf(List),
    PropTypes.string,
  ]).isRequired,
  formId: PropTypes.string.isRequired,
  hasAutofill: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

BigCheckboxField.defaultProps = {
  hasAutofill: false,
};

export default withTranslation("BigCheckboxField")(BigCheckboxField);
