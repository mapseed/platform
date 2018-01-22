import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./secondary-button.scss";

const SecondaryButton = props => {
  return (
    <button
      className={classNames("secondary-button", props.className)}
      type="button"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

SecondaryButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default SecondaryButton;
