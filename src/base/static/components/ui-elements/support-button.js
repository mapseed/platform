import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import SecondaryButton from "./secondary-button";

import "./support-button.scss";

const SupportButton = props => {
  return (
    <SecondaryButton
      className={classNames("support-button", props.className, {
        "support-button--supported": props.isSupported,
      })}
      onClick={props.onClickSupport}
    >
      {props.numSupports || ""} {props.label}
    </SecondaryButton>
  );
};

SupportButton.propTypes = {
  className: PropTypes.string,
  isSupported: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  numSupports: PropTypes.number,
  onClickSupport: PropTypes.func.isRequired,
};

export default SupportButton;
