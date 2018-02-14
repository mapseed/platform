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
  children: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.string,
  ]),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default SecondaryButton;
