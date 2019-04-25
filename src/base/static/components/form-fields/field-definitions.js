/* eslint react/display-name: 0 */

import React from "react";
import { fromJS, List } from "immutable";

import constants from "../../constants";
import {
  TextField,
  TextareaField,
  DropdownField,
  DatetimeField,
  GeocodingField,
  AddAttachmentButton,
  BigRadioField,
  BigCheckboxField,
  InputFormSubmitButton,
  RichTextareaField,
  MapDrawingToolbar,
  AutocompleteComboboxField,
  BigToggleField,
  PublishControlToolbar,
  RangeSliderWithLabel,
  TextFieldResponse,
  TextareaFieldResponse,
  RichTextareaFieldResponse,
  RangeFieldResponse,
  BigCheckboxFieldResponse,
  BigRadioFieldResponse,
  DatetimeFieldResponse,
  BigToggleFieldResponse,
  DropdownFieldResponse,
  AutocompleteComboboxFieldResponse,
  InformationalHTMLField,
  NumberField,
  NumberFieldResponse,
  GeolocateField,
} from "./types";
import { isWithAnyValue, isNotEmpty } from "./validators";
import { insertEmbeddedImages } from "../../utils/embedded-images";

const getDefaultValidator = isOptional => {
  return {
    validate: isOptional ? isWithAnyValue : isNotEmpty,
    message: "missingRequired",
  };
};

const getPermissiveValidator = () => {
  return {
    validate: isWithAnyValue,
    message: "",
  };
};

const getSharedFieldProps = (fieldConfig, context) => {
  return {
    disabled: context.props.disabled,
    hasAutofill: fieldConfig.hasAutofill,
    formId: context.props.formId,
    name: fieldConfig.name,
    onChange: context.onChange.bind(context),
    placeholder: fieldConfig.placeholder,
    value: context.props.fieldState.get(constants.FIELD_VALUE_KEY),
    isAutoFocusing: !!context.props.fieldState.get(
      constants.FIELD_AUTO_FOCUS_KEY,
    ),
  };
};

export default {
  [constants.TEXT_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <TextField {...getSharedFieldProps(fieldConfig, context)} />
    ),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => TextFieldResponse,
  },
  [constants.TEXTAREA_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <TextareaField {...getSharedFieldProps(fieldConfig, context)} />
    ),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => TextareaFieldResponse,
  },
  [constants.NUMBER_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <NumberField
        {...getSharedFieldProps(fieldConfig, context)}
        min={fieldConfig.min}
        max={fieldConfig.max}
      />
    ),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => NumberFieldResponse,
  },
  [constants.GEOLOCATE_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <GeolocateField {...getSharedFieldProps(fieldConfig, context)} />
    ),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => null,
  },
  [constants.RICH_TEXTAREA_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      // TODO: make bounds prop configurable.
      <RichTextareaField
        {...getSharedFieldProps(fieldConfig, context)}
        onAddAttachment={context.props.onAddAttachment.bind(context)}
        bounds="#content"
      />
    ),
    getInitialValue: ({ value, attachments }) =>
      insertEmbeddedImages(value, attachments),
    getResponseComponent: () => RichTextareaFieldResponse,
  },
  [constants.BIG_CHECKBOX_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) =>
      fieldConfig.content.map(item => (
        <BigCheckboxField
          key={item.value}
          value={item.value}
          label={item.label}
          formId={context.props.formId}
          id={"input-form-" + fieldConfig.name + "-" + item.value}
          checkboxGroupState={context.props.fieldState.get(
            constants.FIELD_VALUE_KEY,
          )}
          name={fieldConfig.name}
          onChange={context.onChange.bind(context)}
          hasAutofill={fieldConfig.hasAutofill}
        />
      )),
    getInitialValue: ({ value }) => fromJS(value) || List(),
    getResponseComponent: () => BigCheckboxFieldResponse,
  },
  [constants.BIG_RADIO_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) =>
      fieldConfig.content.map(item => (
        <BigRadioField
          key={item.value}
          value={item.value}
          label={item.label}
          formId={context.props.formId}
          id={"input-form-" + fieldConfig.name + "-" + item.value}
          checked={
            context.props.fieldState.get(constants.FIELD_VALUE_KEY) ===
            item.value
          }
          name={fieldConfig.name}
          onChange={context.onChange.bind(context)}
          hasAutofill={fieldConfig.hasAutofill}
        />
      )),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => BigRadioFieldResponse,
  },
  [constants.DROPDOWN_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <DropdownField
        {...getSharedFieldProps(fieldConfig, context)}
        options={fieldConfig.content}
      />
    ),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => DropdownFieldResponse,
  },
  [constants.DROPDOWN_AUTOCOMPLETE_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <AutocompleteComboboxField
        {...getSharedFieldProps(fieldConfig, context)}
        options={fieldConfig.content}
        id={"autocomplete-" + fieldConfig.name}
        showAllValues={true}
      />
    ),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => AutocompleteComboboxFieldResponse,
  },
  [constants.PUBLISH_CONTROL_TOOLBAR_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <PublishControlToolbar
        {...getSharedFieldProps(fieldConfig, context)}
        publishedState={context.props.fieldState.get(constants.FIELD_VALUE_KEY)}
      />
    ),
    getInitialValue: ({ value }) => value || "isPublished",
    getResponseComponent: () => null,
  },
  [constants.MAP_DRAWING_TOOLBAR_TYPENAME]: {
    getValidator: () => {
      return {
        validate: isNotEmpty,
        message: "missingGeometry",
      };
    },
    getComponent: (fieldConfig, context) => (
      <MapDrawingToolbar
        {...getSharedFieldProps(fieldConfig, context)}
        markers={fieldConfig.content.map(item => item.marker)}
        existingGeometry={context.props.existingGeometry}
        existingGeometryStyle={context.props.existingGeometryStyle}
        existingPlaceId={context.props.existingPlaceId}
        datasetSlug={context.props.datasetSlug}
      />
    ),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => null,
  },
  [constants.DATETIME_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <DatetimeField
        {...getSharedFieldProps(fieldConfig, context)}
        showTimeSelect={fieldConfig.show_time_select}
        timeFormat={fieldConfig.time_format}
        dateFormat={fieldConfig.date_format}
        displayFormat={fieldConfig.display_format}
        ongoingLabel={fieldConfig.ongoing_label}
      />
    ),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => DatetimeFieldResponse,
  },
  [constants.GEOCODING_FIELD_TYPENAME]: {
    getValidator: getPermissiveValidator,
    getComponent: (fieldConfig, context) => (
      <GeocodingField
        {...getSharedFieldProps(fieldConfig, context)}
        onUpdateMapViewport={context.props.onUpdateMapViewport}
      />
    ),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => null,
  },
  [constants.BIG_TOGGLE_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <BigToggleField
        name={fieldConfig.name}
        checked={
          context.props.fieldState.get(constants.FIELD_VALUE_KEY) ===
          fieldConfig.content[0].value
        }
        labels={[fieldConfig.content[0].label, fieldConfig.content[1].label]}
        values={[fieldConfig.content[0].value, fieldConfig.content[1].value]}
        formId={context.props.formId}
        id={"input-form-" + fieldConfig.name}
        onChange={context.onChange.bind(context)}
        hasAutofill={fieldConfig.hasAutofill}
      />
    ),
    getInitialValue: ({ value, fieldConfig }) =>
      value || fieldConfig.content[1].value, // "off" position of the toggle
    getResponseComponent: () => BigToggleFieldResponse,
  },
  [constants.ATTACHMENT_FIELD_TYPENAME]: {
    getValidator: getPermissiveValidator,
    getComponent: (fieldConfig, context) => (
      <AddAttachmentButton
        name={fieldConfig.name}
        onAddAttachment={context.props.onAddAttachment.bind(context)}
        onChange={context.onChange.bind(context)}
        label={fieldConfig.label}
        formId={context.props.formId}
      />
    ),
    getInitialValue: () => null,
    getResponseComponent: () => null,
  },
  [constants.SUBMIT_FIELD_TYPENAME]: {
    getValidator: getPermissiveValidator,
    getComponent: (fieldConfig, context) => (
      <InputFormSubmitButton
        {...getSharedFieldProps(fieldConfig, context)}
        onClickSubmit={context.props.onClickSubmit.bind(context)}
        label={fieldConfig.label}
      />
    ),
    getInitialValue: () => null,
    getResponseComponent: () => null,
  },
  [constants.RANGE_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <RangeSliderWithLabel
        {...getSharedFieldProps(fieldConfig, context)}
        max={fieldConfig.max}
        min={fieldConfig.min}
      />
    ),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => RangeFieldResponse,
  },
  [constants.INFORMATIONAL_HTML_FIELD_TYPENAME]: {
    getValidator: getPermissiveValidator,
    getComponent: (fieldConfig, context) => (
      <InformationalHTMLField
        {...getSharedFieldProps(fieldConfig, context)}
        content={fieldConfig.content}
      />
    ),
    getInitialValue: () => null,
    getResponseComponent: () => null,
  },
};
