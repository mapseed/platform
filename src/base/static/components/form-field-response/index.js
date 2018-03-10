import React from "react";
import PropTypes from "prop-types";

import fieldDefinitions from "../form-field/field-definitions";

import "./form-field-response.scss";

const FormFieldResponse = props => {
  const fieldResponse = fieldDefinitions[
    props.fieldConfig.type
  ].getResponseComponent(
    props.fieldValue,
    props.fieldConfig,
    props.backboneAttachmentModelsAttributes
  );

  return (
    <div className="form-field-response">
      <p className="form-field-response__header">
        {props.fieldConfig.display_prompt}
      </p>
      {fieldResponse}
    </div>
  );
};

FormFieldResponse.propTypes = {
  fieldConfig: PropTypes.object.isRequired,
  fieldValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  backboneAttachmentModelsAttributes: PropTypes.object,
};

export default FormFieldResponse;
