import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./primary-button.scss";

const PrimaryButton = props => {
  const { className, children, disabled, onClick } = props;
  const cn = classNames(
    "primary-button",
    "primary-button--hoverable",
    className
  );

  return (
    <button className={cn} type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};

PrimaryButton.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export default PrimaryButton;
