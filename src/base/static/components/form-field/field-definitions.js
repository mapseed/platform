import React from "react";
import { fromJS, List as ImmutableList } from "immutable";

import constants from "../constants";
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
} from "../form-field-types";
import {
  mayHaveAnyValue,
  mustHaveSomeValue,
  mustHaveUniqueUrl,
} from "./validators";
import { inputForm as messages } from "../messages.js";

const getDefaultValidator = isOptional => {
  return {
    validate: isOptional ? mayHaveAnyValue : mustHaveSomeValue,
    message: messages.missingRequired,
  };
};

const getPermissiveValidator = () => {
  return {
    validate: mayHaveAnyValue,
    message: "",
  };
};

const getDefaultInitialValue = (autofillValue, defaultValue) => {
  return autofillValue || defaultValue || "";
};

const getSharedFieldProps = (fieldConfig, context) => {
  return {
    disabled: context.props.disabled,
    hasAutofill: fieldConfig.hasAutofill,
    name: fieldConfig.name,
    onChange: context.onChange.bind(context),
    placeholder: fieldConfig.placeholder,
    value: context.props.fieldState.get(constants.FIELD_STATE_VALUE_KEY),
  };
};

export default {
  [constants.TEXT_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <TextField {...getSharedFieldProps(fieldConfig, context)} />
    ),
    getInitialValue: (autofillValue, defaultValue) =>
      getDefaultInitialValue(autofillValue, defaultValue),
  },
  [constants.TEXTAREA_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <TextareaField {...getSharedFieldProps(fieldConfig, context)} />
    ),
    getInitialValue: (autofillValue, defaultValue) =>
      getDefaultInitialValue(autofillValue, defaultValue),
  },
  [constants.RICH_TEXTAREA_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      // TODO: make bounds prop configurable.
      <RichTextareaField
        {...getSharedFieldProps(fieldConfig, context)}
        onAdditionalData={context.props.onAdditionalData.bind(context)}
        bounds="#content"
      />
    ),
    getInitialValue: (autofillValue, defaultValue) =>
      getDefaultInitialValue(autofillValue, defaultValue),
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
            constants.FIELD_STATE_VALUE_KEY
          )}
          name={fieldConfig.name}
          onChange={context.onChange.bind(context)}
          hasAutofill={fieldConfig.hasAutofill}
        />
      )),
    getInitialValue: (autofillValue, defaultValue) =>
      fromJS(autofillValue) || fromJS(defaultValue) || ImmutableList(),
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
            context.props.fieldState.get(constants.FIELD_STATE_VALUE_KEY) ===
            item.value
          }
          name={fieldConfig.name}
          onChange={context.onChange.bind(context)}
          hasAutofill={fieldConfig.hasAutofill}
        />
      )),
    getInitialValue: (autofillValue, defaultValue) =>
      getDefaultInitialValue(autofillValue, defaultValue),
  },
  [constants.DROPDOWN_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <DropdownField
        {...getSharedFieldProps(fieldConfig, context)}
        options={fieldConfig.content}
      />
    ),
    getInitialValue: (autofillValue, defaultValue) =>
      getDefaultInitialValue(autofillValue, defaultValue),
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
    getInitialValue: (autofillValue, defaultValue) =>
      getDefaultInitialValue(autofillValue, defaultValue),
  },
  [constants.PUBLISH_CONTROL_TOOLBAR_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <PublishControlToolbar
        {...getSharedFieldProps(fieldConfig, context)}
        publishedState={context.props.fieldState.get(
          constants.FIELD_STATE_VALUE_KEY
        )}
      />
    ),
    getInitialValue: (autofillValue, defaultValue) =>
      autofillValue || defaultValue || "isPublished",
  },
  [constants.MAP_DRAWING_TOOLBAR_TYPENAME]: {
    getValidator: () => {
      return {
        validate: mustHaveSomeValue,
        message: messages.missingGeometry,
      };
    },
    getComponent: (fieldConfig, context) => (
      <MapDrawingToolbar
        {...getSharedFieldProps(fieldConfig, context)}
        onGeometryStyleChange={context.props.onGeometryStyleChange.bind(
          context
        )}
        map={context.props.map}
        markers={fieldConfig.content.map(item => item.url)}
        router={context.props.router}
      />
    ),
    getInitialValue: () => "",
  },
  [constants.CUSTOM_URL_TOOLBAR_TYPENAME]: {
    getValidator: () => {
      return {
        validate: mustHaveUniqueUrl,
        message: messages.duplicateUrl,
      };
    },
    getComponent: (fieldConfig, context) => (
      <CustomUrlToolbar {...getSharedFieldProps(fieldConfig, context)} />
    ),
    getInitialValue: (autofillValue, defaultValue) =>
      getDefaultInitialValue(autofillValue, defaultValue),
  },
  [constants.DATETIME_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <DatetimeField
        {...getSharedFieldProps(fieldConfig, context)}
        date={context.props.fieldState.get(constants.FIELD_STATE_VALUE_KEY)}
        showTimeSelect={true}
      />
    ),
    getInitialValue: (autofillValue, defaultValue) =>
      getDefaultInitialValue(autofillValue, defaultValue),
  },
  [constants.GEOCODING_FIELD_TYPENAME]: {
    getValidator: getPermissiveValidator,
    getComponent: (fieldConfig, context) => (
      <GeocodingField
        {...getSharedFieldProps(fieldConfig, context)}
        mapConfig={context.props.mapConfig}
      />
    ),
    getInitialValue: (autofillValue, defaultValue) =>
      getDefaultInitialValue(autofillValue, defaultValue),
  },
  [constants.BIG_TOGGLE_FIELD_TYPENAME]: {
    getValidator: getDefaultValidator,
    getComponent: (fieldConfig, context) => (
      <BigToggleField
        name={fieldConfig.name}
        checked={
          context.props.fieldState.get(constants.FIELD_STATE_VALUE_KEY) ===
          fieldConfig.content[0].value
        }
        labels={[fieldConfig.content[0].label, fieldConfig.content[1].label]}
        values={[fieldConfig.content[0].value, fieldConfig.content[1].value]}
        id={"input-form-" + fieldConfig.name}
        onChange={context.onChange.bind(context)}
        hasAutofill={fieldConfig.hasAutofill}
      />
    ),
    getInitialValue: (autofillValue, defaultValue, fieldConfig) =>
      autofillValue || defaultValue || fieldConfig.content[1].value, // "off" position of the toggle
  },
  [constants.ATTACHMENT_FIELD_TYPENAME]: {
    getValidator: getPermissiveValidator,
    getComponent: (fieldConfig, context) => (
      <AddAttachmentButton
        name={fieldConfig.name}
        onAdditionalData={context.props.onAdditionalData.bind(context)}
        onChange={context.onChange.bind(context)}
        label={fieldConfig.label}
      />
    ),
    getInitialValue: () => null,
  },
  [constants.SUBMIT_FIELD_TYPENAME]: {
    getValidator: getPermissiveValidator,
    getComponent: fieldConfig => (
      <InputFormSubmitButton
        name={fieldConfig.name}
        label={fieldConfig.label}
      />
    ),
    getInitialValue: () => null,
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
    getInitialValue: (autofillValue, defaultValue) =>
      getDefaultInitialValue(autofillValue, defaultValue),
  },
};
