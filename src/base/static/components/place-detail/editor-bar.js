import React from "react";
import PropTypes from "prop-types";
import emitter from "../../utils/emitter";

import EditorButton from "../ui-elements/editor-button";
import { placeDetailEditor as messages } from "../../messages";

import "./editor-bar.scss";

const EditorBar = props => {
  return (
    <div className="place-detail-editor-bar">
      <EditorButton
        className="place-detail-editor-bar__toggle-button"
        isSubmitting={props.isSubmitting}
        label={messages.toggleBtn}
        type="toggle"
        isEditModeToggled={props.isEditModeToggled}
        onClick={props.onToggleEditMode}
      />
      {props.isEditModeToggled && (
        <EditorButton
          className="place-detail-editor-bar__remove-button"
          isSubmitting={props.isSubmitting}
          label={messages.removeBtn}
          type="remove"
          onClick={() => emitter.emit("place-model:remove")}
        />
      )}
      {props.isEditModeToggled && (
        <EditorButton
          className="place-detail-editor-bar__save-button"
          isSubmitting={props.isSubmitting}
          label={messages.saveBtn}
          type="save"
          onClick={() => emitter.emit("place-model:update")}
        />
      )}
      <div className="place-detail-editor-bar__clearfix" />
    </div>
  );
};

EditorBar.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  onToggleEditMode: PropTypes.func.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
};

export default EditorBar;
