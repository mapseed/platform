import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import SecondaryButton from "./secondary-button";
import { support as supportConfig } from "config";

import "./support-button.scss";

const SupportButton = props => {
  return (
    <SecondaryButton
      className={classNames("support-button", props.className, {
        "support-button--supported": props.isSupported,
      })}
      onClick={props.onClickSupport}
    >
      {props.numSupports || ""} {supportConfig.submit_btn_text}
    </SecondaryButton>
  );
};

SupportButton.propTypes = {
  className: PropTypes.string,
  isSupported: PropTypes.bool.isRequired,
  numSupports: PropTypes.number,
  onClickSupport: PropTypes.func.isRequired,
};

export default SupportButton;
