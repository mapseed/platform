import PropTypes from "prop-types";
import React from "react";
import classNames from "classnames";
import styled from "react-emotion";

import { TwitterIcon, FacebookIcon } from "./icons";

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

const IconButton = styled(props => {
  let Icon;
  switch (props.icon) {
    case "facebook":
      Icon = FacebookIcon;
      break;
    default:
    case "twitter":
      Icon = TwitterIcon;
      break;
  }
  return (
    <button
      style={props.style}
      className={props.className}
      type="button"
      onClick={props.onClick}
    >
      <Icon style={{ height: "100%", width: "100%" }} />
    </button>
  );
})(props => {
  const styles = {
    padding: 0,
    border: 0,
    width: "40px",
    height: "40px",
    backgroundColor: "transparent",
  };
  if (props.size === "small") {
    styles.height = "32px";
    styles.width = "32px";
  } else if (props.size === "large") {
    styles.height = "48px";
    styles.width = "48px";
  }
  return styles;
});

// Influenced by the material-ui api:
// https://material-ui.com/api/button/
const Button = styled(props => {
  return (
    <button
      style={props.style}
      className={props.className}
      type="button"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
})(props => {
  const styles = {
    cursor: "pointer",
    color: props.theme.text.primary,
    backgroundColor: props.theme.bg.default,
    textTransform: props.theme.text.textTransform,
    outline: "none",

    fontSize: "1rem",
    padding: "0.5rem",

    fontWeight: "200",

    border: "0px solid rgba(27,31,35,0.2)",
    borderRadius: "3px",

    "&:hover": {
      color: props.theme.bg.light,
    },
  };

  if (props.size === "large") {
    styles.fontWeight = "600";
    styles.fontSize = "1.25rem";
    styles.padding = "0.5rem 0.75rem 0.5rem 0.75rem";
  } else if (props.size === "medium") {
    styles.width = "200px";
    styles.height = "40px";
  } else if (props.size === "small") {
    styles.width = "auto";
    styles.height = "24px";
    styles.fontSize = ".8em";
    styles.padding = "4px";
  }

  if (props.variant === "raised") {
    styles.boxShadow = "-0.25em 0.25em 0 rgba(0, 0, 0, 0.1)";
    styles.border = "3px solid rgba(0, 0, 0, 0.05)";
  } else if (props.variant === "outlined") {
    styles.border = `3px solid ${props.theme.brand.primary}`;
  }

  if (props.color === "primary") {
    styles.backgroundColor = props.theme.brand.primary;
    styles.color = props.theme.text.primary;
    styles["&:hover"].textDecoration = "none";
  } else if (props.color === "secondary") {
    styles.backgroundColor = props.theme.bg.light;
    styles.color = props.theme.text.secondary;
    styles["&:hover"].color = props.theme.text.primary;
    styles["&:hover"].textDecoration = "none";
  } else if (props.color === "tertiary") {
    styles.backgroundColor = props.theme.bg.default;
    styles.color = props.theme.brand.primary;
    styles["&:hover"].color = props.theme.text.primary;
    styles["&:hover"].backgroundColor = props.theme.brand.accent;
    styles["&:hover"].textDecoration = "none";
  } else if (props.color === "black") {
    styles.backgroundColor = "#fff";
    styles.color = "black";
    styles["&:hover"].color = "grey";
    styles["&:hover"].backgroundColor = "#fff";
    styles["&:hover"].textDecoration = "none";
  } else if (props.color === "grey") {
    styles.backgroundColor = "#fff";
    styles.color = "grey";
    styles["&:hover"].color = "black";
    styles["&:hover"].backgroundColor = "#fff";
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

Button.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.string,
  disabled: PropTypes.bool,
  variant: PropTypes.string,
  color: PropTypes.string,
};

Button.defaultProps = {
  variant: "unstyled",
};

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

export { Button, EditorButton, ToolbarButton, IconButton };
