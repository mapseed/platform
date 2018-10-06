import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styled from "react-emotion";

import { Icon } from "./feedback";

import "./buttons.scss";

const EditorButton = props => {
  return (
    <button
      className={classNames("editor-button", props.className, {
        "editor-button--toggle": props.type === "toggle",
        "editor-button--toggle--depressed":
          props.type === "toggle" && props.isEditModeToggled,
        "editor-button--save": props.type === "save",
        "editor-button--remove": props.type === "remove",
      })}
      disabled={props.isSubmitting}
      onClick={props.onClick}
    >
      <span
        className={classNames("editor-button__icon", {
          "editor-button__icon--toggle": props.type === "toggle",
          "editor-button__icon--save": props.type === "save",
          "editor-button__icon--remove": props.type === "remove",
        })}
      />
      {!!props.label && (
        <span className="editor-button__label">{props.label}</span>
      )}
    </button>
  );
};

EditorButton.propTypes = {
  className: PropTypes.string,
  isEditModeToggled: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

// TODO: Phase this out as we move to CSS-in-JS:
const LegacyButton = ({ children, ...props }) => {
  return (
    <button
      type="button"
      className={classNames("mapseed__link", props.classes, {
        "mapseed__button--unstyled": props.variant.includes("unstyled"),
        "mapseed__button--rounded": props.variant.includes("rounded"),
        "mapseed__button--raised": props.variant.includes("raised"),
        "mapseed__button--depressable": props.variant.includes("depressable"),
        "mapseed__button--color-primary": props.color === "primary",
        "mapseed__button--color-secondary": props.color === "secondary",
        "mapseed__button--color-accent": props.color === "accent",
      })}
      {...props}
    >
      {children}
    </button>
  );
};

LegacyButton.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.string,
  disabled: PropTypes.bool,
  variant: PropTypes.string,
  color: PropTypes.string,
};

LegacyButton.defaultProps = {
  variant: "unstyled",
};

const Button = styled(LegacyButton)(props => {
  const styles = {
    border: "0px solid rgba(27,31,35,0.2)",
    cursor: "pointer",
    color: props.theme.text.primary,
    backgroundColor: props.theme.bg.default,
    textTransform: props.theme.text.textTransform,
    outline: "none",

    padding: props.large ? "0.5em 0.75em 0.5em 0.75em" : "0.5em",
    fontSize: props.large ? "1.25em" : "1em",
    fontWeight: props.large ? "600" : "200",

    "&:hover": {
      color: props.theme.bg.light,
    },
  };

  if (props.primary) {
    styles.backgroundColor = props.theme.brand.primary;
    styles.color = props.theme.text.primary;
    styles["&:hover"].textDecoration = "none";
  } else if (props.secondary) {
    styles.backgroundColor = props.theme.bg.light;
    styles.color = props.theme.text.secondary;
    styles["&:hover"].color = props.theme.text.primary;
    styles["&:hover"].textDecoration = "none";
  }

  if (props.disabled) {
    styles.backgroundColor = "#999";
    styles.color = "#ccc";
    styles.cursor = "not-allowed";
    styles["&:hover"].cursor = "initial";
    styles["&:hover"].color = "#ccc";
  }
  return styles;
});

const ToolbarButton = props => {
  return (
    <button
      className={classNames("mapseed__toolbar-button", props.classes)}
      type="button"
      {...props}
    >
      {props.icon && (
        <Icon
          classes={classNames("mapseed__toolbar-button-icon", {
            "mapseed__toolbar-button-icon--right-margin": !!props.label,
          })}
          icon={props.icon}
          prefix={props.prefix}
        />
      )}
      {props.label && (
        <span className="mapseed__toolbar-button-label">{props.label}</span>
      )}
    </button>
  );
};
ToolbarButton.propTypes = {
  classes: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  prefix: PropTypes.string,
};

export { Button, EditorButton, ToolbarButton };
