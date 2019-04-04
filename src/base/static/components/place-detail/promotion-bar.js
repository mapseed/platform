import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { connect } from "react-redux";

import styled from "@emotion/styled";
import SupportButton from "../ui-elements/support-button";
import { IconButton } from "../atoms/buttons";

import {
  createPlaceSupport,
  removePlaceSupport,
} from "../../state/ducks/places";

import mapseedApiClient from "../../client/mapseed-api-client";

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
  onClickSupport = async () => {
    if (this.props.userSupport) {
      // If we already have user support for the current user token, we should
      // unsupport.
      const supportId = this.props.userSupport.id;
      const response = await mapseedApiClient.support.delete(
        this.props.placeUrl,
        supportId,
      );

      if (response) {
        this.props.removePlaceSupport(this.props.placeId, supportId);
        Util.log("USER", "place", "successfully-unsupport");
      } else {
        alert("Oh dear. It looks like that didn't save.");
        Util.log("USER", "place", "fail-to-unsupport");
      }
    } else {
      // Otherwise, we're supporting.
      const response = await mapseedApiClient.support.create(
        this.props.placeUrl,
        {
          user_token: this.props.userToken,
          visible: true,
        },
      );

      if (response) {
        this.props.createPlaceSupport(this.props.placeId, response);
        Util.log("USER", "place", "successfully-support");
      } else {
        alert("Oh dear. It looks like that didn't save.");
        Util.log("USER", "place", "fail-to-support");
      }
    }
  };

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
          isSupported={!!this.props.userSupport}
          numSupports={this.props.numSupports}
          onClickSupport={this.onClickSupport}
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
  createPlaceSupport: PropTypes.func.isRequired,
  removePlaceSupport: PropTypes.func.isRequired,
  isHorizontalLayout: PropTypes.bool.isRequired,
  numSupports: PropTypes.number,
  onSocialShare: PropTypes.func.isRequired,
  userSupport: PropTypes.object,
  userToken: PropTypes.string,
  placeId: PropTypes.number.isRequired,
  placeUrl: PropTypes.string.isRequired,
};

PromotionBar.defaultProps = {
  isHorizontalLayout: false,
};

const mapDispatchToProps = dispatch => ({
  createPlaceSupport: (placeId, supportData) =>
    dispatch(createPlaceSupport(placeId, supportData)),
  removePlaceSupport: (placeId, supportId) =>
    dispatch(removePlaceSupport(placeId, supportId)),
});

export default connect(
  null,
  mapDispatchToProps,
)(PromotionBar);
