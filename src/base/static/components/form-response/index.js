import React, { Component } from "react";
import PropTypes from "prop-types";

import TextFieldResponse from "../form-response-types/text-field-response";
import TextareaFieldResponse from "../form-response-types/textarea-field-response";
import RichTextareaFieldResponse from "../form-response-types/rich-textarea-field-response";
import RangeFieldResponse from "../form-response-types/range-field-response";
import BigCheckboxFieldResponse from "../form-response-types/big-checkbox-field-response";
import BigRadioFieldResponse from "../form-response-types/big-radio-field-response";
import DatetimeFieldResponse from "../form-response-types/datetime-field-response";
import BigToggleFieldResponse from "../form-response-types/big-toggle-field-response";
import DropdownFieldResponse from "../form-response-types/dropdown-field-response";
import AutocompleteComboboxFieldResponse from "../form-response-types/autocomplete-combobox-field-response";

import "./field-response.scss";
import constants from "../constants";

class FieldResponse extends Component {
  buildFieldResponse(fieldConfig) {
    switch (fieldConfig.type) {
      case constants.TEXT_FIELD_TYPENAME:
        return <TextFieldResponse value={fieldConfig.content} />;
      case constants.TEXTAREA_FIELD_TYPENAME:
        return <TextareaFieldResponse value={fieldConfig.content} />;
      case constants.RICH_TEXTAREA_FIELD_TYPENAME:
        return (
          <RichTextareaFieldResponse
            value={fieldConfig.content}
            model={this.props.model}
          />
        );
      case constants.CUSTOM_URL_TOOLBAR_TYPENAME:
        return null;
      case constants.MAP_DRAWING_TOOLBAR_TYPENAME:
        return null;
      case constants.ATTACHMENT_FIELD_TYPENAME:
        return null;
      case constants.SUBMIT_FIELD_TYPENAME:
        return null;
      case constants.RANGE_FIELD_TYPENAME:
        return <RangeFieldResponse value={fieldConfig.content.value} />;
      case constants.BIG_CHECKBOX_FIELD_TYPENAME:
        return <BigCheckboxFieldResponse value={fieldConfig.content} />;
      case constants.BIG_RADIO_FIELD_TYPENAME:
        return <BigRadioFieldResponse value={fieldConfig.content} />;
      case constants.PUBLISH_CONTROL_TOOLBAR_TYPENAME:
        return null;
      case constants.DATETIME_FIELD_TYPENAME:
        return <DatetimeFieldResponse value={fieldConfig.content} />;
      case constants.GEOCODING_FIELD_TYPENAME:
        return null;
      case constants.BIG_TOGGLE_FIELD_TYPENAME:
        return <BigToggleFieldResponse value={fieldConfig.content} />;
      case constants.DROPDOWN_FIELD_TYPENAME:
        return <DropdownFieldResponse value={fieldConfig.content} />;
      case constants.DROPDOWN_AUTOCOMPLETE_FIELD_TYPENAME:
        return (
          <AutocompleteComboboxFieldResponse value={fieldConfig.content} />
        );
      case constants.COMMON_FORM_ELEMENT_TYPENAME:
        return this.buildFieldResponse(
          Object.assign(
            {},
            this.props.placeConfig.common_form_elements[fieldConfig.name],
            { name: fieldConfig.name }
          )
        );
      default:
        console.error(
          "Error: cannot render unknown form field type:",
          fieldConfig.type
        );
        return null;
    }
  }

  render() {
    const field = this.buildFieldResponse(this.props.field);
    return (
      <div className="field-response-container">
        <p className="field-response-display-header">
          {this.props.field.display_prompt}
        </p>
        {field}
      </div>
    );
  }
}

FieldResponse.propTypes = {
  field: PropTypes.object.isRequired,
  model: PropTypes.object.isRequired,
};

export default FieldResponse;
