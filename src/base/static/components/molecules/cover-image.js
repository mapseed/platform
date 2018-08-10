import React from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";

import { EditorButton } from "../atoms/buttons";

import "./cover-image.scss";

const CoverImage = props => {
  return (
    <div className="cover-image">
      {props.isShowingDeleteButton && (
        <EditorButton
          className="cover-image__delete-button"
          type="remove"
          onClick={props.onClickRemove}
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

CoverImage.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  isShowingDeleteButton: PropTypes.bool.isRequired,
  onClickRemove: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate("CoverImage")(CoverImage);
