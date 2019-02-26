import React from "react";
import PropTypes from "prop-types";

import { insertEmbeddedImages } from "../../../utils/embedded-images";

const RichTextareaFieldResponse = props => {
  return (
    <div
      className="rich-textarea-field-response"
      dangerouslySetInnerHTML={{
        __html: insertEmbeddedImages(props.value, props.attachments),
      }}
    />
  );
};

RichTextareaFieldResponse.propTypes = {
  attachments: PropTypes.array,
  value: PropTypes.string.isRequired,
};

export default RichTextareaFieldResponse;
