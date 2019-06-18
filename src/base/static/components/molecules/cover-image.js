/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import { translate } from "react-i18next";

import { EditorButton } from "../atoms/buttons";

import "./cover-image.scss";

const CoverImage = props => {
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
      <img
        css={css`
          width: 100%;
          max-width: 100%;
        `}
        src={props.imageUrl}
        alt={props.t("coverImageAltText")}
      />
    </div>
  );
};

CoverImage.defaultProps = {
  isEditable: false,
};

CoverImage.propTypes = {
  attachmentId: PropTypes.number,
  imageUrl: PropTypes.string.isRequired,
  isEditable: PropTypes.bool.isRequired,
  onClickRemove: PropTypes.func,
  t: PropTypes.func.isRequired,
};

export default translate("CoverImage")(CoverImage);
