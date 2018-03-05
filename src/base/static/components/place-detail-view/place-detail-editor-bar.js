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
        label={messages.toggleBtn}
        type="toggle"
      />
      <EditorButton
        className="place-detail-editor-bar__save-button"
        label={messages.saveBtn}
        type="save"
      />
      <EditorButton
        className="place-detail-editor-bar__remove-button"
        label={messages.removeBtn}
        type="remove"
      />
      <div className="place-detail-editor-bar__clearfix" />
    </div>
  );
};

PlaceDetailEditorBar.propTypes = {};

export default PlaceDetailEditorBar;
