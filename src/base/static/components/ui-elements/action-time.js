import React from "react";
import PropTypes from "prop-types";

import "./action-time.scss";

// TODO: replace moment global.

const ActionTime = props => {
  return <time className="action-time">{moment(props.time).fromNow()}</time>;
};

ActionTime.propTypes = {
  time: PropTypes.string.isRequired,
};

export default ActionTime;
