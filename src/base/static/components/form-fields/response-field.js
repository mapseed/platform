/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";

import { TinyTitle } from "../atoms/typography";

import fieldDefinitions from "./field-definitions";

// NOTE: Checkbox values might be a string (for a single checked item) or an
// array (for multiple items). We resolve that discrepancy here, ensuring all
// responses are an array.
const getCheckboxLabels = (fieldValue, fieldConfig) => {
  if (!fieldConfig.content) return null;

  if (!Array.isArray(fieldValue)) {
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
    <div
      css={css`
        margin-bottom: 10px;
      `}
    >
      <TinyTitle
        css={css`
          margin-bottom: 4px;
        `}
      >
        {props.fieldConfig.display_prompt}
      </TinyTitle>
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
  attachments: PropTypes.array,
};

export default ResponseField;
