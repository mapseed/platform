import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { TextField, TextareaField, DropdownField } from "../basic-input-fields";
import {
  DatetimeField,
  GeocodingField,
  AddAttachmentButton,
  BigRadioField,
  BigCheckboxField,
  InputFormSubmitButton,
  RichTextareaField,
  MapDrawingToolbar,
  AutocompleteComboboxField,
  CustomUrlToolbar,
  BigToggleField,
  PublishControlToolbar,
  RangeSliderWithLabel,
} from "../complex-input-fields";

import "./form-field.scss";
import { inputForm as messages } from "../messages.js";
import constants from "../constants";

class FormField extends Component {
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.showValidityStatus ||
      nextProps.updatingField === this.props.config.name
    );
  }

  onChange(fieldName, fieldValue) {
    this.props.onChange(
      fieldName,
      fieldValue,
      this.props.validator.validate(fieldValue),
      this.props.validator.message
    );
  }

  buildField(fieldConfig) {
    // TODO: appropriate field visibility based on admin status

    const cn = {
      optionalMsg: classNames("input-form__optional-msg", {
        "input-form__optional-msg--visible": fieldConfig.optional,
      }),
    };
    const fieldPrompt = (
      <p className="input-form__field-prompt" key={1}>
        {fieldConfig.prompt}
        <span className={cn.optionalMsg}>{messages.optionalMsg}</span>
      </p>
    );

    const sharedProps = {
      autofillMode: this.props.autofillMode,
      disabled: this.props.disabled,
      hasAutofill: fieldConfig.hasAutofill,
      key: 2,
      name: fieldConfig.name,
      onAdditionalData: this.props.onAdditionalData,
      onChange: this.onChange.bind(this),
      placeholder: fieldConfig.placeholder,
      value: this.props.value,
    };

    switch (fieldConfig.type) {
      case constants.TEXT_FIELD_TYPENAME:
        return [fieldPrompt, <TextField {...sharedProps} />];
      case constants.TEXTAREA_FIELD_TYPENAME:
        return [fieldPrompt, <TextareaField {...sharedProps} />];
      case constants.RICH_TEXTAREA_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <RichTextareaField {...sharedProps} bounds="#content" />,
        ];
      case constants.CUSTOM_URL_TOOLBAR_TYPENAME:
        return [fieldPrompt, <CustomUrlToolbar {...sharedProps} />];
      case constants.MAP_DRAWING_TOOLBAR_TYPENAME:
        return [
          fieldPrompt,
          <MapDrawingToolbar
            {...sharedProps}
            map={this.props.map}
            markers={fieldConfig.content.map(item => item.url)}
            router={this.props.router}
          />,
        ];
      case constants.ATTACHMENT_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <AddAttachmentButton {...sharedProps} label={fieldConfig.label} />,
        ];
      case constants.SUBMIT_FIELD_TYPENAME:
        return (
          <InputFormSubmitButton
            name={fieldConfig.name}
            label={fieldConfig.label}
          />
        );
      case constants.RANGE_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <RangeSliderWithLabel
            {...sharedProps}
            max={fieldConfig.max}
            min={fieldConfig.min}
          />,
        ];
      case constants.BIG_CHECKBOX_FIELD_TYPENAME:
        return [
          fieldPrompt,
          fieldConfig.content.map(item => (
            <BigCheckboxField
              key={item.value}
              value={item.value}
              label={item.label}
              id={"input-form-" + fieldConfig.name + "-" + item.value}
              checkboxGroupState={this.props.value}
              name={fieldConfig.name}
              onChange={this.onChange.bind(this)}
              autofillMode={this.props.autofillMode}
              hasAutofill={fieldConfig.hasAutofill}
            />
          )),
        ];
      case constants.BIG_RADIO_FIELD_TYPENAME:
        return [
          fieldPrompt,
          fieldConfig.content.map(item => (
            <BigRadioField
              key={item.value}
              value={item.value}
              label={item.label}
              id={"input-form-" + fieldConfig.name + "-" + item.value}
              checked={this.props.value === item.value}
              name={fieldConfig.name}
              onChange={this.onChange.bind(this)}
              autofillMode={this.props.autofillMode}
              hasAutofill={fieldConfig.hasAutofill}
            />
          )),
        ];
      case constants.PUBLISH_CONTROL_TOOLBAR_TYPENAME:
        return (
          <PublishControlToolbar
            {...sharedProps}
            publishedState={this.props.value}
          />
        );
      case constants.DATETIME_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <DatetimeField
            {...sharedProps}
            date={this.props.value}
            showTimeSelect={true}
          />,
        ];
      case constants.GEOCODING_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <GeocodingField
            {...sharedProps}
            mapConfig={this.props.mapConfig}
            emitter={this.props.emitter}
          />,
        ];
      case constants.BIG_TOGGLE_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <BigToggleField
            name={fieldConfig.name}
            checked={this.props.value === fieldConfig.content[0].value}
            key={2}
            labels={[
              fieldConfig.content[0].label,
              fieldConfig.content[1].label,
            ]}
            values={[
              fieldConfig.content[0].value,
              fieldConfig.content[1].value,
            ]}
            id={"input-form-" + fieldConfig.name}
            onChange={this.onChange.bind(this)}
            autofillMode={this.props.autofillMode}
            hasAutofill={fieldConfig.hasAutofill}
          />,
        ];
      case constants.DROPDOWN_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <DropdownField {...sharedProps} options={fieldConfig.content} />,
        ];
      case constants.DROPDOWN_AUTOCOMPLETE_FIELD_TYPENAME:
        return [
          fieldPrompt,
          <AutocompleteComboboxField
            {...sharedProps}
            options={fieldConfig.content}
            id={"autocomplete-" + fieldConfig.name}
            showAllValues={true}
          />,
        ];
      case constants.COMMON_FORM_ELEMENT_TYPENAME:
        const commonFormElementConfig = Object.assign(
          {},
          this.props.placeConfig.common_form_elements[fieldConfig.name],
          { name: fieldConfig.name }
        );
        return this.buildField(commonFormElementConfig);
      default:
        console.error("Error: unknown form field type:", fieldConfig.type);
        return null;
    }
  }

  render() {
    const cn = classNames("input-form__field-container", {
      "input-form__field-container--invalid":
        !this.props.validator.validate(this.props.value) &&
        this.props.showValidityStatus,
      "input-form__field-container--hidden":
        this.props.value &&
        this.props.config.hasAutofill &&
        this.props.autofillMode === "hide",
    });

    return <div className={cn}>{this.buildField(this.props.config)}</div>;
  }
}

export default FormField;
