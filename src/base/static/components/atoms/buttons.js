import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";

import { Icon } from "./feedback";

import "./buttons.scss";

const ToolbarButton = props => {
  return (
    <button
      className={classNames("mapseed__toolbar-button", props.classes)}
      {...props}
    >
      {props.icon && (
        <Icon
          classes={classNames("mapseed__toolbar-button-icon", {
            "mapseed__toolbar-button-icon--right-margin": !!props.label,
          })}
          icon={props.icon}
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
};

export { ToolbarButton };
