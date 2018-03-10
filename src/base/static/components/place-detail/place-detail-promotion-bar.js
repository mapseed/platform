import React from "react";
import PropTypes from "prop-types";

import SupportButton from "../ui-elements/support-button";
import SocialShareButton from "../ui-elements/social-share-button";

import "./place-detail-promotion-bar.scss";

const PlaceDetailPromotionBar = props => {
  return (
    <div className="place-detail-promotion-bar">
      <SupportButton
        className="place-detail-promotion-bar__support-button"
        isSupported={props.isSupported}
        label={props.supportConfig.submit_btn_text}
        numSupports={props.numSupports}
        onClickSupport={props.onClickSupport}
      />
      <div className="place-detail-promotion-bar__social-buttons">
        <SocialShareButton
          onSocialShare={props.onSocialShare}
          type="facebook"
        />
        <SocialShareButton onSocialShare={props.onSocialShare} type="twitter" />
      </div>
    </div>
  );
};

PlaceDetailPromotionBar.propTypes = {
  isSupported: PropTypes.bool.isRequired,
  numSupports: PropTypes.number,
  onClickSupport: PropTypes.func.isRequired,
  onSocialShare: PropTypes.func.isRequired,
  supportConfig: PropTypes.object.isRequired,
};

export default PlaceDetailPromotionBar;
