import React, { Component } from "react";
import PropTypes from "prop-types";
import { Map as ImmutableMap } from "immutable";
import classNames from "classnames";

import fieldDefinitions from "./field-definitions";
import { inputForm as messages } from "../messages.js";
import constants from "../constants";

import "./form-field.scss";

const Util = require("../../js/utils.js");

class FormField extends Component {
  constructor(props) {
    super(props);
    this.fieldDefinition = fieldDefinitions[this.props.fieldConfig.type];
    this.validator = this.fieldDefinition.getValidator(
      this.props.fieldConfig.optional
    );

    this.isInitialized = false;
  }

  componentDidMount() {
    // "autofill" is a better term than "autocomplete" for this feature.
    // TODO: Update this throughout the codebase.
    const autofillValue = this.props.fieldConfig.autocomplete
      ? Util.getAutocompleteValue(this.props.fieldConfig.name)
      : null;
    this.props.fieldConfig.hasAutofill = !!autofillValue;
    const initialFieldValue = this.fieldDefinition.getInitialValue(
      this.props.fieldState.get(constants.FIELD_STATE_VALUE_KEY),
      autofillValue,
      this.props.fieldConfig.default_value,
      this.props.fieldConfig,
      this.props.attachmentModels
    );

    this.isInitialized = true;
    this.onChange(this.props.fieldConfig.name, initialFieldValue, true);
  }

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.isInitializing ||
      nextProps.showValidityStatus ||
      nextProps.updatingField === this.props.fieldConfig.name
    );
  }

  onChange(fieldName, fieldValue, isInitializing = false) {
    this.props.onFieldChange(
      fieldName,
      ImmutableMap()
        .set(constants.FIELD_STATE_VALUE_KEY, fieldValue)
        .set(
          constants.FIELD_STATE_VALIDITY_KEY,
          this.validator.validate(fieldValue, this.props.places)
        )
        .set(
          constants.FIELD_STATE_RENDER_KEY,
          this.props.fieldState.get(constants.FIELD_STATE_RENDER_KEY)
        )
        .set(
          constants.FIELD_STATE_VALIDITY_MESSAGE_KEY,
          this.validator.message
        ),
      isInitializing
    );
  }

  render() {
    const cn = {
      container: classNames("input-form__field-container", {
        "input-form__field-container--invalid":
          this.props.showValidityStatus &&
          !this.props.fieldState.get(constants.FIELD_STATE_VALIDITY_KEY),
      }),
      optionalMsg: classNames("input-form__optional-msg", {
        "input-form__optional-msg--visible": this.props.fieldConfig.optional,
      }),
    };

    return this.isInitialized ? (
      <div className={cn.container}>
        <p className="input-form__field-prompt">
          {this.props.fieldConfig.prompt}
          <span className={cn.optionalMsg}>{messages.optionalMsg}</span>
        </p>
        {this.fieldDefinition.getComponent(this.props.fieldConfig, this)}
      </div>
    ) : null;
  }
}

FormField.propTypes = {
  attachmentModels: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
    .isRequired,
  categoryConfig: PropTypes.object,
  disabled: PropTypes.bool,
  fieldConfig: PropTypes.object.isRequired,
  fieldState: PropTypes.object,
  map: PropTypes.object,
  mapConfig: PropTypes.object,
  onFieldChange: PropTypes.func.isRequired,
  onGeometryStyleChange: PropTypes.func,
  places: PropTypes.object,
  router: PropTypes.object,
  showValidityStatus: PropTypes.bool.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
    PropTypes.bool,
    PropTypes.object,
  ]),
};

FormField.defaultProps = {
  attachmentModels: [],
};

export default FormField;
