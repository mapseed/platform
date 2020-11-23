import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";

import { insertEmbeddedImages } from "../../../utils/embedded-images";

const RichTextareaFieldResponseWrapper = styled("div")(props => ({
  // TODO: fluid video
  lineHeight: "1.3rem",
  "& img": {
    maxWidth: "100%",
    margin: "16px 0 0 0",
  },
  "& ul": {
    marginTop: 0,
    marginBottom: "16px",
    fontWeight: "normal",
  },
  "& p": {
    fontFamily: props.theme.text.bodyFontFamily,
    marginTop: 0,
    marginBottom: "16px",
    fontWeight: "normal",
  },
  "& li": {
    fontFamily: props.theme.text.bodyFontFamily,
    fontWeight: "normal",
  },
  "& a": {
    textDectoration: "none",
    fontWeight: "normal",
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
