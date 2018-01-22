import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./primary-button.scss";

const PrimaryButton = props => {
  const cn = classNames(
    "primary-button",
    "primary-button--hoverable",
    props.className
  );

  return (
    <button
      className={cn}
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

PrimaryButton.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export default PrimaryButton;
