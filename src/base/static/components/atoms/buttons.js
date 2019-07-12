/** @jsx jsx */
import * as React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styled from "@emotion/styled";
import { css, jsx } from "@emotion/core";
import { withTheme } from "emotion-theming";

import { TwitterIcon, FacebookIcon } from "./icons";
import { FontAwesomeIcon } from "./imagery";
import { SmallText } from "./typography";

import { CHARCOAL, OFF_WHITE, getReadableColor } from "../../utils/color";
import { LegacyIcon } from "./feedback";

import "./buttons.scss";

const EditorButton = withTheme(props => {
  let linearGradient;
  let faClassname;
  if (props.type === "toggle" && props.isEditModeToggled) {
    linearGradient = "linear-gradient(#e99a00, #b97a00)";
    faClassname = "fa fa-pencil"; // pencil icon
  } else if (props.type === "toggle") {
    linearGradient = "linear-gradient(#f0ad4e, #e99a00)";
    faClassname = "fa fa-pencil"; // pencil icon
  } else if (props.type === "save") {
    linearGradient = "linear-gradient(#449d44, #449d44)";
    faClassname = "fa fa-save"; // floppy disk icon
  } else if (props.type === "remove") {
    linearGradient = "linear-gradient(#c9302c, #c9302c)";
    faClassname = "fa fa-times"; // times (X) icon
  }

  return (
    <button
      css={css`
        float: ${props.type === "toggle" ? "left" : "right"};
        margin-right: 8px;
        display: flex;
        align-items: center;
        background-color: ${props.isEditModeToggled ? "#b27600" : "unset"};
        box-shadow: ${props.isEditModeToggled
          ? "inset 0 0 2px #999"
          : "-2px 2px 3px #ccc"};
        border-radius: 3px;
        border: none;
        color: white;
        text-transform: uppercase;
        font-size: 0.8em;
        padding: 5px 10px 5px 10px;
        background-image: ${linearGradient};
        font-family: ${props.theme.text.bodyFontFamily};

        &:hover {
          cursor: pointer;
          box-shadow: ${props.isEditModeToggled
            ? "inset 0 0 0 1px #27496d"
            : "-2px 2px 3px #ccc, inset 0 0 0 1px #27496d"};
        }

        &:focus {
          outline: none;
        }
      `}
      disabled={props.isSubmitting}
      onClick={props.onClick}
      type="button"
      className={props.className}
    >
      <FontAwesomeIcon
        faClassname={faClassname}
        color="#fff"
        hoverColor="#fff"
      />
      {!!props.label && (
        <SmallText
          css={css`
            padding-left: 8px;
          `}
        >
          {props.label}
        </SmallText>
      )}
    </button>
  );
});

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
      aria-label={`${props.icon} button`}
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
    cursor: "pointer",
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
      aria-label={props.ariaLabel}
      className={props.className}
      type="button"
      onClick={props.onClick}
      name={props.name}
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

  if (props.size === "full-width") {
    styles.width = "100%";
  } else if (props.size === "extra-large") {
    styles.fontWeight = "800";
    styles.fontSize = "1.5rem";
    styles.padding = "16px 24px 16px 24px";
  } else if (props.size === "large") {
    styles.fontWeight = "600";
    styles.fontSize = "1.25rem";
    styles.padding = "0.5rem 0.75rem 0.5rem 0.75rem";
  } else if (props.size === "medium") {
    styles.fontWeight = "600";
    styles.fontSize = "1rem";
    styles.padding = "0.25rem 0.5rem 0.25rem 0.5rem";
  } else if (props.size === "small") {
    styles.width = "auto";
    styles.fontSize = "1rem";
    styles.padding = "4px 8px 4px 8px";
  }

  if (props.variant === "raised") {
    styles.boxShadow = "-0.25em 0.25em 0 rgba(0, 0, 0, 0.1)";
    styles.border = "3px solid rgba(0, 0, 0, 0.05)";
  } else if (props.variant === "outlined") {
    styles.border = `3px solid ${props.theme.brand.primary}`;
  }

  if (props.color === "primary") {
    styles.backgroundColor = props.theme.brand.primary;
    styles.color = props.theme.text.secondary;
    styles["&:hover"].textDecoration = "none";
    styles["&:hover"].backgroundColor = props.theme.brand.primary;
    styles["&:hover"].color = getReadableColor(
      styles["&:hover"].backgroundColor,
    );
  } else if (props.color === "secondary") {
    styles.backgroundColor = props.theme.bg.light;
    styles.color = getReadableColor(styles.backgroundColor);
    styles["&:hover"].backgroundColor = props.theme.brand.secondary;
    styles["&:hover"].color = getReadableColor(props.theme.brand.secondary);
    styles["&:hover"].textDecoration = "none";
  } else if (props.color === "tertiary") {
    styles.backgroundColor = "transparent";
    styles.color = props.theme.text.tertiary;
    styles["&:hover"].backgroundColor = props.theme.text.secondary;
    styles["&:hover"].color = getReadableColor(
      styles["&:hover"].backgroundColor,
    );
    styles["&:hover"].textDecoration = "none";
  } else if (props.color === "black") {
    styles.backgroundColor = CHARCOAL;
    styles.color = getReadableColor(styles.backgroundColor);
    styles["&:hover"].backgroundColor = OFF_WHITE;
    styles["&:hover"].color = getReadableColor(
      styles["&:hover"].backgroundColor,
    );
    styles["&:hover"].textDecoration = "none";
  } else if (props.color === "grey") {
    styles.backgroundColor = "#fff";
    styles.color = "grey";
    styles["&:hover"].color = "black";
    styles["&:hover"].backgroundColor = getReadableColor(
      styles["&:hover"].color,
    );
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
  ariaLabel: PropTypes.string,
  disabled: PropTypes.bool,
  variant: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string,
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
        <LegacyIcon
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

const CloseButton = styled(props => (
  <button
    aria-label="close"
    className={props.className}
    onClick={props.onClick}
    css={{
      border: "none",
      backgroundColor: "transparent",
      color: "#ff5e99",

      "&:hover": {
        cursor: "pointer",
        color: "#cd2c67",
      },
    }}
  >
    {"✕"}
  </button>
))({
  color: "red",
  fontSize: "1.5em",
});

export { Button, EditorButton, ToolbarButton, IconButton, CloseButton };
