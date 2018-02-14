import React from "react";
import PropTypes from "prop-types";

import SupportButton from "../ui-elements/support-button";
import SocialShareButton from "../ui-elements/social-share-button";

import "./submission-promotion-bar.scss";

const SubmissionPromotionBar = props => {
  return (
    <section className="submission-promotion-bar">
      <SupportButton
        className="submission-promotion-bar__support-button"
        collection={
          props.model.submissionSets[props.supportConfig.submission_type]
        }
        label={props.supportConfig.submit_btn_text}
        userToken={props.userToken}
      />
      <section className="submission-promotion-bar__social-buttons">
        <SocialShareButton model={props.model} type="facebook" />
        <SocialShareButton model={props.model} type="twitter" />
      </section>
    </section>
  );
};

SubmissionPromotionBar.propTypes = {
  model: PropTypes.object.isRequired,
  supportConfig: PropTypes.object.isRequired,
  userToken: PropTypes.string.isRequired,
};

export default SubmissionPromotionBar;
