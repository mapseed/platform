import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { connect } from "react-redux";

import SecondaryButton from "./secondary-button";
import { supportConfigSelector } from "../../state/ducks/support-config";

import "./support-button.scss";

const SupportButton = props => {
  return (
    <SecondaryButton
      className={classNames("support-button", props.className, {
        "support-button--supported": props.isSupported,
      })}
      onClick={props.onClickSupport}
    >
      {props.numSupports || ""} {props.supportConfig.submit_btn_text}
    </SecondaryButton>
  );
};

SupportButton.propTypes = {
  className: PropTypes.string,
  isSupported: PropTypes.bool.isRequired,
  numSupports: PropTypes.number,
  onClickSupport: PropTypes.func.isRequired,
  supportConfig: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  supportConfig: supportConfigSelector(state),
});

export default connect(mapStateToProps)(SupportButton);
