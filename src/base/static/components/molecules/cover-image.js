import React from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";

import { EditorButton } from "../atoms/buttons";

import "./cover-image.scss";

const CoverImage = props => {
  return (
    <div className="cover-image">
      {props.isEditModeToggled && (
        <EditorButton
          className="cover-image__delete-button"
          type="remove"
          onClick={() => {
            props.onAttachmentModelRemove(
              {
                visible: false,
              },
              props.modelId,
            );
          }}
        />
      )}
      <img
        className="cover-image__image"
        src={props.url}
        alt={props.t("coverImageAltText")}
      />
    </div>
  );
};

CoverImage.propTypes = {
  isEditModeToggled: PropTypes.bool.isRequired,
  modelId: PropTypes.string.isRequired,
  onAttachmentModelRemove: PropTypes.func.isRequired,
  onModelIO: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
};

export default translate("CoverImage")(CoverImage);
