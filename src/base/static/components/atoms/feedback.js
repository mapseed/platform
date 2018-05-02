import React from "react";
import PropTypes from "prop-types";

import "./feedback.scss";

const ProgressBar = props => {
  return (
    <div className="mapseed__progress-bar">
      <div
        className="mapseed__progress-bar-inner"
        style={{ width: props.currentProgress / props.total * 100 + "%" }}
      />
    </div>
  );
};

ProgressBar.propTypes = {
  currentProgress: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

export { ProgressBar };
