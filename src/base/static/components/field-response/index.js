import React from "react";
import PropTypes from "prop-types";

import fieldDefinitions from "../form-field/field-definitions";

import "./field-response.scss";

const FieldResponse = props => {
  const fieldResponse = fieldDefinitions[
    props.fieldConfig.type
  ].getResponseComponent(
    props.fieldValue,
    props.fieldConfig,
    props.backboneAttachmentModels
  );

  return (
    <div className="field-response">
      <p className="field-response__header">
        {props.fieldConfig.display_prompt}
      </p>
      {fieldResponse}
    </div>
  );
};

FieldResponse.propTypes = {
  fieldConfig: PropTypes.object.isRequired,
  fieldValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  backboneAttachmentModels: PropTypes.object,
};

export default FieldResponse;
