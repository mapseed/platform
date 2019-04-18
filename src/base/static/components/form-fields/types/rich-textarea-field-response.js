import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";

import { insertEmbeddedImages } from "../../../utils/embedded-images";

const RichTextareaFieldResponseWrapper = styled("div")(props => ({
  "& img": {
    maxWidth: "100%",
    margin: "16px 0",
  },
  "& p": {
    fontFamily: props.theme.text.bodyFontFamily,
  },
  "& a": {
    textDectoration: "none",
  },
  "& h1,h2,h3,h4,h5,h6": {
    fontFamily: props.theme.text.titleFontFamily,
    margin: "16px 0 8px 0",
  },
}));

const RichTextareaFieldResponse = props => {
  return (
    <RichTextareaFieldResponseWrapper>
      <div
        className="rich-textarea-field-response"
        dangerouslySetInnerHTML={{
          __html: insertEmbeddedImages(props.value, props.attachments),
        }}
      />
    </RichTextareaFieldResponseWrapper>
  );
};

RichTextareaFieldResponse.propTypes = {
  attachments: PropTypes.array,
  value: PropTypes.string.isRequired,
};

export default RichTextareaFieldResponse;
