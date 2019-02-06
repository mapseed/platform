import React from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";

import { EditorButton } from "../atoms/buttons";

import "./cover-image.scss";

const CoverImage = props => {
  return (
    <div className="cover-image">
      {props.isEditable && (
        <EditorButton
          className="cover-image__delete-button"
          type="remove"
          onClick={() => {
            if (confirm(props.t("confirmAttachmentRemove"))) {
              props.onClickRemove(props.attachmentId);
            }
          }}
        />
      )}
      <img
        className="cover-image__image"
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
