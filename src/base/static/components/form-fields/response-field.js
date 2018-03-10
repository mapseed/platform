import React from "react";
import PropTypes from "prop-types";

import fieldDefinitions from "./field-definitions";

import "./response-field.scss";

const ResponseField = props => {
  return (
    <div className="form-field-response">
      <p className="form-field-response__header">
        {props.fieldConfig.display_prompt}
      </p>
      {fieldDefinitions[props.fieldConfig.type].getResponseComponent(
        props.fieldValue,
        props.fieldConfig,
        props.attachmentModels
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
  ]).isRequired,
  attachmentModels: PropTypes.object,
};

export default ResponseField;
