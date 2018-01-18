import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./secondary-button.scss";

const SecondaryButton = props => {
  const { children, className, onClick } = props;

  return (
    <button
      className={classNames("secondary-button", className)}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

SecondaryButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default SecondaryButton;
