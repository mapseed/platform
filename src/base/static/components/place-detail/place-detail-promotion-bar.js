import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import SupportButton from "../ui-elements/support-button";
import SocialShareButton from "../ui-elements/social-share-button";

import "./place-detail-promotion-bar.scss";

const PlaceDetailPromotionBar = props => {
  return (
    <div
      className={classNames("place-detail-promotion-bar", {
        "place-detail-promotion-bar--with-bottom-space":
          props.isHorizontalLayout,
      })}
    >
      <SupportButton
        className="place-detail-promotion-bar__support-button"
        isSupported={props.isSupported}
        label={props.supportConfig.submit_btn_text}
        numSupports={props.numSupports}
        onClickSupport={props.onClickSupport}
      />
      <div
        className={classNames("place-detail-promotion-bar__social-buttons", {
          "place-detail-promotion-bar__social-buttons--horizontal":
            props.isHorizontalLayout,
        })}
      >
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
  isHorizontalLayout: PropTypes.bool.isRequired,
  isSupported: PropTypes.bool.isRequired,
  numSupports: PropTypes.number,
  onClickSupport: PropTypes.func.isRequired,
  onSocialShare: PropTypes.func.isRequired,
  supportConfig: PropTypes.object.isRequired,
};

PlaceDetailPromotionBar.defaultProps = {
  isHorizontalLayout: false,
};

export default PlaceDetailPromotionBar;
