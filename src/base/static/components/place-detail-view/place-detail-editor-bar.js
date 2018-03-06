import React from "react";
import PropTypes from "prop-types";

import EditorButton from "../ui-elements/editor-button";
import { placeDetailEditor as messages } from "../messages";

import "./place-detail-editor-bar.scss";

const PlaceDetailEditorBar = props => {
  return (
    <div className="place-detail-editor-bar">
      <EditorButton
        className="place-detail-editor-bar__toggle-button"
        isFormSubmitting={props.isFormSubmitting}
        label={messages.toggleBtn}
        type="toggle"
        isEditModeToggled={props.isEditModeToggled}
        onClick={props.onToggleEditMode}
      />
      {props.isEditModeToggled ? (
        <EditorButton
          className="place-detail-editor-bar__remove-button"
          isFormSubmitting={props.isFormSubmitting}
          label={messages.removeBtn}
          type="remove"
          onClick={props.onRemove}
        />
      ) : null}
      {props.isEditModeToggled ? (
        <EditorButton
          className="place-detail-editor-bar__save-button"
          isFormSubmitting={props.isFormSubmitting}
          isModified={props.isModified}
          label={messages.saveBtn}
          type="save"
          onClick={props.onSave}
        />
      ) : null}
      <div className="place-detail-editor-bar__clearfix" />
    </div>
  );
};

PlaceDetailEditorBar.propTypes = {
  isFormSubmitting: PropTypes.bool.isRequired,
  isModified: PropTypes.bool.isRequired,
  onRemove: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onToggleEditMode: PropTypes.func.isRequired,
  isEditModeToggled: PropTypes.bool.isRequired,
};

export default PlaceDetailEditorBar;
