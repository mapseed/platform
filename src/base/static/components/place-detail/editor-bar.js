import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { EditorButton } from "../atoms/buttons";
import { translate } from "react-i18next";

import "./editor-bar.scss";

const EditorBar = props => {
  return (
    <div className={classNames("place-detail-editor-bar")}>
      <EditorButton
        className="place-detail-editor-bar__toggle-button"
        label={props.t("toggleBtn")}
        type="toggle"
        isEditModeToggled={props.isEditModeToggled}
        onClick={props.onToggleEditMode}
      />
      {props.isEditModeToggled &&
        props.isPlaceDetailEditable &&
        props.isAdmin && (
          <EditorButton
            className="place-detail-editor-bar__remove-button"
            label={props.t("removeBtn")}
            type="remove"
            onClick={() => {
              if (confirm(props.t("confirmRemove"))) {
                props.onClickRemovePlace();
              }
            }}
          />
        )}
      {props.isEditModeToggled &&
        props.isPlaceDetailEditable && (
          <EditorButton
            className="place-detail-editor-bar__save-button"
            label={props.t("saveBtn")}
            type="save"
            onClick={props.onClickUpdatePlace}
          />
        )}
      <div className="place-detail-editor-bar__clearfix" />
    </div>
  );
};

EditorBar.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isGeocodingBarEnabled: PropTypes.bool,
  isPlaceDetailEditable: PropTypes.bool.isRequired,
  isTagBarEditable: PropTypes.bool.isRequired,
  onToggleEditMode: PropTypes.func.isRequired,
  onClickUpdatePlace: PropTypes.func.isRequired,
  onClickRemovePlace: PropTypes.func.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate("EditorBar")(EditorBar);
