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
  CustomUrlToolbar,
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
} from "./types";
import { isWithAnyValue, isNotEmpty, isWithUniqueUrl } from "./validators";
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
    name: fieldConfig.name,
    onChange: context.onChange.bind(context),
    placeholder: fieldConfig.placeholder,
    value: context.props.fieldState.get(constants.FIELD_VALUE_KEY),
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
    getInitialValue: ({ value, attachmentModels }) =>
      insertEmbeddedImages(value, attachmentModels),
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
        existingLayerView={context.props.existingLayerView}
        existingGeometry={context.props.existingGeometry}
        existingGeometryStyle={context.props.existingGeometryStyle}
        fieldConfig={fieldConfig}
        onGeometryStyleChange={context.props.onGeometryStyleChange.bind(
          context,
        )}
        map={context.props.map}
        markers={fieldConfig.content.map(item => item.url)}
        router={context.props.router}
      />
    ),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => null,
  },
  [constants.CUSTOM_URL_TOOLBAR_TYPENAME]: {
    getValidator: () => {
      return {
        validate: isWithUniqueUrl,
        message: "duplicateUrl",
      };
    },
    getComponent: (fieldConfig, context) => (
      <CustomUrlToolbar {...getSharedFieldProps(fieldConfig, context)} />
    ),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => null,
  },
  [constants.DATETIME_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <DatetimeField
        {...getSharedFieldProps(fieldConfig, context)}
        date={context.props.fieldState.get(constants.FIELD_VALUE_KEY)}
        showTimeSelect={fieldConfig.show_time_select}
      />
    ),
    getInitialValue: ({ value }) => value,
    getResponseComponent: () => DatetimeFieldResponse,
  },
  [constants.GEOCODING_FIELD_TYPENAME]: {
    getValidator: getPermissiveValidator,
    getComponent: (fieldConfig, context) => (
      <GeocodingField {...getSharedFieldProps(fieldConfig, context)} />
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
