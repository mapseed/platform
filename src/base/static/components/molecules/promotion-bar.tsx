/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import { connect } from "react-redux";

import styled from "@emotion/styled";
import SupportButton from "../molecules/support-button";
import { IconButton } from "../atoms/buttons";
import LoginModal from "../molecules/login-modal";

import {
  createPlaceSupport,
  removePlaceSupport,
} from "../../state/ducks/places";
import {
  sharingProvidersSelector,
  SharingProvidersConfig,
  AppConfig,
} from "../../state/ducks/app-config";

import mapseedApiClient from "../../client/mapseed-api-client";

import Util from "../../js/utils.js";
import { userSelector, User } from "../../state/ducks/user";
import { datasetsSelector, Dataset } from "../../state/ducks/datasets";
import { Support } from "../../models/place";

const SocialMediaButton = styled(IconButton)({
  float: "right",
  borderRadius: "4px",
  marginLeft: "8px",
  border: "none",
  backgroundPosition: "center",
});

type PromotionBarProps = {
  appConfig: AppConfig;
  createPlaceSupport: typeof createPlaceSupport;
  datasets: Dataset[];
  removePlaceSupport: typeof removePlaceSupport;
  isHorizontalLayout: boolean;
  numSupports: number;
  onSocialShare: Function;
  userSupport?: Support;
  placeId: number;
  placeUrl: string;
  currentUser: User;
  sharingProviders: SharingProvidersConfig;
};

class PromotionBar extends React.Component<PromotionBarProps> {
  static defaultProps = {
    isHorizontalLayout: false,
  };

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
          user_token: this.props.currentUser.token,
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
      <div>
        <LoginModal
          appConfig={this.props.appConfig}
          render={openModal => (
            <SupportButton
              isSupported={!!this.props.userSupport}
              numSupports={this.props.numSupports}
              onClickSupport={() => {
                if (
                  !this.props.currentUser.isAuthenticated &&
                  this.props.datasets.some(dataset => dataset.auth_required)
                ) {
                  openModal();
                } else {
                  this.onClickSupport();
                }
              }}
            />
          )}
        />
        <div>
          {this.props.sharingProviders.map(provider => (
            <SocialMediaButton
              key={provider.type}
              onClick={() => this.props.onSocialShare(provider.type)}
              icon={provider.type}
              size="small"
            />
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  sharingProviders: sharingProvidersSelector(state),
  datasets: datasetsSelector(state),
  user: userSelector(state),
});

const mapDispatchToProps = dispatch => ({
  createPlaceSupport: (placeId, supportData) =>
    dispatch(createPlaceSupport(placeId, supportData)),
  removePlaceSupport: (placeId, supportId) =>
    dispatch(removePlaceSupport(placeId, supportId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PromotionBar);
