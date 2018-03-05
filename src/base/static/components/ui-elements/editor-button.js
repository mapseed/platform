import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./editor-button.scss";

const EditorButton = props => {
  return (
    <button
      className={classNames("editor-button", props.className, {
        "editor-button--toggle": props.type === "toggle",
        "editor-button--save": props.type === "save",
        "editor-button--remove": props.type === "remove",
      })}
    >
      <span
        className={classNames("editor-button__icon", props.className, {
          "editor-button__icon--toggle": props.type === "toggle",
          "editor-button__icon--save": props.type === "save",
          "editor-button__icon--remove": props.type === "remove",
        })}
      />
      {props.label}
    </button>
  );
};

EditorButton.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default EditorButton;
