/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import { withTranslation } from "react-i18next";
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';

import { EditorButton } from "../atoms/buttons";

const CoverPDF = props => {
  return (
    <div
      css={css`
        position: relative;
        margin-top: 20px;
        margin-bottom: 20px;
      `}
    >
      {props.isEditable && (
        <EditorButton
          css={css`
            position: absolute;
            top: 8px;
            right: 4px;
            box-shadow: -2px 2px 3px #555;
          `}
          type="remove"
          onClick={() => {
            if (confirm(props.t("confirmAttachmentRemove"))) {
              props.onClickRemove(props.attachmentId);
            }
          }}
        />
      )}
      <Document file={props.pdfUrl}>
      {/* TODO: Multi-page PDFs */}
        <Page pageNumber={1} />
      </Document>
    </div>
  );
};

CoverPDF.defaultProps = {
  isEditable: false,
};

CoverPDF.propTypes = {
  attachmentId: PropTypes.number,
  pdfUrl: PropTypes.string.isRequired,
  isEditable: PropTypes.bool.isRequired,
  onClickRemove: PropTypes.func,
  t: PropTypes.func.isRequired,
};

export default withTranslation("CoverPDF")(CoverPDF);
