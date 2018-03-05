import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import SupportButton from "../ui-elements/support-button";
import SocialShareButton from "../ui-elements/social-share-button";

import "./place-detail-promotion-bar.scss";

const PlaceDetailPromotionBar = props => {
  return (
    <section
      className={classNames("place-detail-promotion-bar", {
        "place-detail-promotion-bar--with-top-margin": props.isEditble,
      })}
    >
      <SupportButton
        className="place-detail-promotion-bar__support-button"
        collection={
          props.model.submissionSets[props.supportConfig.submission_type]
        }
        label={props.supportConfig.submit_btn_text}
        userToken={props.userToken}
      />
      <section className="place-detail-promotion-bar__social-buttons">
        <SocialShareButton model={props.model} type="facebook" />
        <SocialShareButton model={props.model} type="twitter" />
      </section>
    </section>
  );
};

PlaceDetailPromotionBar.propTypes = {
  isEditble: PropTypes.bool.isEditble,
  model: PropTypes.object.isRequired,
  supportConfig: PropTypes.object.isRequired,
  userToken: PropTypes.string.isRequired,
};

export default PlaceDetailPromotionBar;
