import React from "react";
import PropTypes from "prop-types";
import moment from "moment";

import "./action-time.scss";

const ActionTime = props => {
  return <time className="action-time">{moment(props.time).fromNow()}</time>;
};

ActionTime.propTypes = {
  time: PropTypes.string.isRequired,
};

export default ActionTime;
