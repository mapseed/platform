/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import { withTranslation } from "react-i18next";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import Button from "@material-ui/core/Button";
import { ChevronRight, ChevronLeft } from "@material-ui/icons";

import { EditorButton } from "../atoms/buttons";
import { SmallText } from "../atoms/typography";

const CoverPDF = props => {
  const pdfContainerRef = React.useRef();
  const [pdfContainerWidth, setPdfContainerWidth] = React.useState(200);
  const [numPages, setNumPages] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);

  React.useEffect(() => {
    setPdfContainerWidth(pdfContainerRef.current.getBoundingClientRect().width);
  }, [setPdfContainerWidth, pdfContainerRef]);

  return (
    <div
      ref={pdfContainerRef}
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
      <Document
        file={props.pdfUrl}
        renderMode="svg"
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        <Page width={pdfContainerWidth} pageNumber={pageNumber} />
      </Document>
      {numPages && (
        <>
          <Button disabled={pageNumber === 1}>
            <ChevronLeft onClick={() => setPageNumber(pageNumber - 1)} />
          </Button>
          <SmallText>
            Page {pageNumber} of {numPages}
          </SmallText>
          <Button disabled={pageNumber === numPages}>
            <ChevronRight onClick={() => setPageNumber(pageNumber + 1)} />
          </Button>
        </>
      )}
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
