import React from "react";
import PropTypes from "prop-types";

import ResponseField from "../form-fields/response-field";
import fieldResponseFilter from "../../utils/field-response-filter";
import CoverImage from "../molecules/cover-image";

import { placePropType } from "../../state/ducks/places";

const FieldSummary = props => {
  return (
    <div className="field-summary">
      {props.place.attachments
        .filter(attachment => attachment.type === "CO")
        .map((attachment, i) => (
          <CoverImage key={i} imageUrl={attachment.file} />
        ))}
      {fieldResponseFilter(props.fields, props.place).map(fieldConfig => (
        <ResponseField
          key={fieldConfig.name}
          fieldConfig={fieldConfig}
          fieldValue={props.place[fieldConfig.name]}
          attachments={props.place.attachments}
        />
      ))}
    </div>
  );
};

FieldSummary.propTypes = {
  fields: PropTypes.array.isRequired,
  place: placePropType.isRequired,
};

export default FieldSummary;
