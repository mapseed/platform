import React from "react";
import PropTypes from "prop-types";

const errorMessagePropTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
};

const ErrorMessage = ({ children, ...props }) => {
  return (
    <p className={"mapseed__warning-msg"} {...props}>
      {children}
    </p>
  );
};
ErrorMessage.propTypes = errorMessagePropTypes;

export { ErrorMessage };
