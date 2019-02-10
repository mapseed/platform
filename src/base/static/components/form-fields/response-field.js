import React from "react";
import PropTypes from "prop-types";
import { List } from "immutable";

import fieldDefinitions from "./field-definitions";

import "./response-field.scss";

// NOTE: Checkbox values might be a string (for a single checked item) or an
// array (for multiple items). We resolve that discrepancy here, ensuring all
// responses are an array.
const getCheckboxLabels = (fieldValue, fieldConfig) => {
  if (!fieldConfig.content) return null;

  if (List.isList(fieldValue)) {
    fieldValue = fieldValue.toArray();
  } else {
    fieldValue = [fieldValue];
  }

  return fieldValue.map(
    value => fieldConfig.content.find(option => option.value === value).label,
  );
};

const getLabel = (fieldValue, fieldConfig) => {
  if (!fieldConfig.content) return null;
  const content =
    fieldConfig.content.find(option => option.value === fieldValue) || {};

  return content.label;
};

const ResponseField = props => {
  const FieldResponseComponent = fieldDefinitions[
    props.fieldConfig.type
  ].getResponseComponent();

  return (
    <div className="form-field-response">
      <p className="form-field-response__header">
        {props.fieldConfig.display_prompt}
      </p>
      {FieldResponseComponent && (
        <FieldResponseComponent
          label={getLabel(props.fieldValue, props.fieldConfig)}
          value={props.fieldValue}
          attachments={props.attachments}
          labels={getCheckboxLabels(props.fieldValue, props.fieldConfig)}
          fieldConfig={props.fieldConfig}
        />
      )}
    </div>
  );
};

ResponseField.propTypes = {
  fieldConfig: PropTypes.object.isRequired,
  fieldValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object,
    PropTypes.number,
  ]).isRequired,
  attachments: PropTypes.instanceOf(List),
};

export default ResponseField;
