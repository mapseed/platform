import React from "react";
import PropTypes from "prop-types";

import ResponseField from "../form-fields/response-field";
import fieldResponseFilter from "../../utils/field-response-filter";
import CoverImage from "../molecules/cover-image";

import constants from "../../constants";

const FieldSummary = props => {
  return (
    <div className="field-summary">
      {props.attachmentModels
        .filter(
          attachment =>
            attachment.get(constants.ATTACHMENT_TYPE_PROPERTY_NAME) ===
            constants.COVER_IMAGE_CODE,
        )
        .map((attachmentModel, i) => (
          <CoverImage
            key={i}
            imageUrl={attachmentModel.get(
              constants.ATTACHMENT_FILE_PROPERTY_NAME,
            )}
          />
        ))}
      {fieldResponseFilter(props.fields, props.placeModel).map(fieldConfig => (
        <ResponseField
          key={fieldConfig.name}
          fieldConfig={fieldConfig}
          fieldValue={props.placeModel.get(fieldConfig.name)}
          attachmentModels={props.attachmentModels}
        />
      ))}
    </div>
  );
};

FieldSummary.propTypes = {
  fields: PropTypes.array.isRequired,
  placeModel: PropTypes.object.isRequired,
  attachmentModels: PropTypes.object.isRequired,
};

export default FieldSummary;
