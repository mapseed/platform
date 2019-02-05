import React from "react";
import PropTypes from "prop-types";
import { Map } from "immutable";

import ResponseField from "../form-fields/response-field";
import fieldResponseFilter from "../../utils/field-response-filter";
import CoverImage from "../molecules/cover-image";

import constants from "../../constants";

const FieldSummary = props => {
  return (
    <div className="field-summary">
      {props.place
        .get("attachments")
        .filter(
          attachment =>
            attachment.get(constants.ATTACHMENT_TYPE_PROPERTY_NAME) ===
            constants.COVER_IMAGE_CODE,
        )
        .map((attachment, i) => (
          <CoverImage
            key={i}
            imageUrl={attachment.get(constants.ATTACHMENT_FILE_PROPERTY_NAME)}
          />
        ))}
      {fieldResponseFilter(props.fields, props.place).map(fieldConfig => (
        <ResponseField
          key={fieldConfig.name}
          fieldConfig={fieldConfig}
          fieldValue={props.place.get(fieldConfig.name)}
          attachments={props.place.get("attachments")}
        />
      ))}
    </div>
  );
};

FieldSummary.propTypes = {
  fields: PropTypes.array.isRequired,
  place: PropTypes.instanceOf(Map),
};

export default FieldSummary;
