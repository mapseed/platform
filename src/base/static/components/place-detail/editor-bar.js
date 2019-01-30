import React from "react";
import PropTypes from "prop-types";
import emitter from "../../utils/emitter";
import classNames from "classnames";

import { EditorButton } from "../atoms/buttons";
import { translate } from "react-i18next";

import "./editor-bar.scss";

const EditorBar = props => {
  return (
    <div
      className={classNames("place-detail-editor-bar", {
        "place-detail-editor-bar--geocoding-bar-enabled":
          props.isGeocodingBarEnabled,
      })}
    >
      <EditorButton
        className="place-detail-editor-bar__toggle-button"
        isSubmitting={props.isSubmitting}
        label={props.t("toggleBtn")}
        type="toggle"
        isEditModeToggled={props.isEditModeToggled}
        onClick={props.onToggleEditMode}
      />
      {props.isEditModeToggled &&
        props.isPlaceDetailEditable && (
          <EditorButton
            className="place-detail-editor-bar__remove-button"
            isSubmitting={props.isSubmitting}
            label={props.t("removeBtn")}
            type="remove"
            onClick={() => emitter.emit("place-model:remove")}
          />
        )}
      {props.isEditModeToggled &&
        props.isPlaceDetailEditable && (
          <EditorButton
            className="place-detail-editor-bar__save-button"
            isSubmitting={props.isSubmitting}
            label={props.t("saveBtn")}
            type="save"
            onClick={() => emitter.emit("place-model:update")}
          />
        )}
      <div className="place-detail-editor-bar__clearfix" />
    </div>
  );
};

EditorBar.propTypes = {
  isGeocodingBarEnabled: PropTypes.bool,
  isPlaceDetailEditable: PropTypes.bool.isRequired,
  isTagBarEditable: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onToggleEditMode: PropTypes.func.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate("EditorBar")(EditorBar);
