import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./feedback.scss";

const ProgressBar = props => {
  return (
    <div className="mapseed__progress-bar">
      <div
        className="mapseed__progress-bar-inner"
        style={{ width: (props.currentProgress / props.total) * 100 + "%" }}
      />
    </div>
  );
};

ProgressBar.propTypes = {
  currentProgress: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

// The source image for an Icon component can be either the name of a
// FontAwesome icon or the url of an image asset. We assume that if the icon
// reference ends with an image filetype, the identifier is an image url.
const LegacyIcon = props => {
  const icon = /\.(jpg|jpeg|png|gif|bmp|svg)$/.test(props.icon) ? (
    <img
      src={props.prefix ? `${props.prefix}${props.icon}` : props.icon}
      className={classNames("mapseed__icon", props.classes)}
    />
  ) : (
    <span
      className={classNames(
        `fas ${props.icon}`,
        "mapseed__icon",
        props.classes,
      )}
    />
  );

  return icon;
};

LegacyIcon.propTypes = {
  classes: PropTypes.string,
  icon: PropTypes.string.isRequired,
  prefix: PropTypes.string,
};

LegacyIcon.defaultProps = {
  icon: "__no-icon__",
};

export { ProgressBar, LegacyIcon };
