import React from "react";
import PropTypes from "prop-types";

import "./typography.scss";

const errorMessagePropTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
};

const WarningMessage = ({ children, ...props }) => {
  return (
    <p className={"mapseed__warning-msg"} {...props}>
      {children}
    </p>
  );
};
WarningMessage.propTypes = errorMessagePropTypes;

export { WarningMessage };
