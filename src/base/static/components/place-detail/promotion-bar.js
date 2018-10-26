import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import styled from "react-emotion";
import SupportButton from "../ui-elements/support-button";
import constants from "../../constants";
import { IconButton } from "../atoms/buttons";

import "./promotion-bar.scss";

const Util = require("../../js/utils.js");

const SocialMediaButton = styled(IconButton)({
  float: "right",
  borderRadius: "4px",
  marginLeft: "8px",
  border: "none",
  backgroundPosition: "center",
});

class PromotionBar extends Component {
  onClickSupport() {
    if (this.props.userSupportModel) {
      // If we already have user support for the current user token, we should
      // unsupport.
      this.props.userSupportModel.destroy({
        wait: true,
        success: () => {
          Util.log(
            "USER",
            "place",
            "successfully-unsupport",
            this.props.getLoggingDetails(),
          );
          this.props.onModelIO(constants.SUPPORT_MODEL_IO_END_SUCCESS_ACTION);
        },
        error: model => {
          this.props.onModelIO(
            constants.SUPPORT_MODEL_IO_END_ERROR_ACTION,
            model.collection,
          );
          alert("Oh dear. It looks like that didn't save.");
          Util.log(
            "USER",
            "place",
            "fail-to-unsupport",
            this.props.getLoggingDetails(),
          );
        },
      });
    } else {
      // Otherwise, we're supporting.
      this.props.supportModelCreate(
        { user_token: this.props.userToken, visible: true },
        {
          wait: true,
          beforeSend: xhr => {
            // Do not generate activity for anonymous supports
            if (!Shareabouts.bootstrapped.currentUser) {
              xhr.setRequestHeader("X-Shareabouts-Silent", "true");
            }
          },
          success: model => {
            this.props.onModelIO(
              constants.SUPPORT_MODEL_IO_END_SUCCESS_ACTION,
              model.collection,
            );
            Util.log(
              "USER",
              "place",
              "successfully-support",
              this.props.getLoggingDetails(),
            );
          },
          error: () => {
            this.props.userSupportModel.destroy();
            alert("Oh dear. It looks like that didn't save.");
            Util.log(
              "USER",
              "place",
              "fail-to-support",
              this.props.getLoggingDetails(),
            );
          },
        },
      );
    }
  }

  render() {
    return (
      <div
        className={classNames("place-detail-promotion-bar", {
          "place-detail-promotion-bar--with-bottom-space": this.props
            .isHorizontalLayout,
        })}
      >
        <SupportButton
          className="place-detail-promotion-bar__support-button"
          isSupported={this.props.isSupported}
          numSupports={this.props.numSupports}
          onClickSupport={this.onClickSupport.bind(this)}
        />
        <div
          className={classNames("place-detail-promotion-bar__social-buttons", {
            "place-detail-promotion-bar__social-buttons--horizontal": this.props
              .isHorizontalLayout,
          })}
        >
          <SocialMediaButton
            onClick={() => this.props.onSocialShare("facebook")}
            icon="facebook"
            size="small"
          />
          <SocialMediaButton
            onClick={() => this.props.onSocialShare("twitter")}
            icon="twitter"
            size="small"
          />
        </div>
      </div>
    );
  }
}

PromotionBar.propTypes = {
  getLoggingDetails: PropTypes.func.isRequired,
  isHorizontalLayout: PropTypes.bool.isRequired,
  isSupported: PropTypes.bool.isRequired,
  numSupports: PropTypes.number,
  onModelIO: PropTypes.func.isRequired,
  onSocialShare: PropTypes.func.isRequired,
  supportModelCreate: PropTypes.func.isRequired,
  userSupportModel: PropTypes.instanceOf(Backbone.Model),
  userToken: PropTypes.string,
};

PromotionBar.defaultProps = {
  isHorizontalLayout: false,
};

export default PromotionBar;
