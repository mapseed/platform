import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";

import "./social-share-button.scss";

const SocialShareButton = props => {
  return (
    <button
      className={classNames("social-share-button", {
        "social-share-button--twitter": props.type === "twitter",
        "social-share-button--facebook": props.type === "facebook",
      })}
      onClick={() => props.onSocialShare(props.type)}
    />
  );
};

SocialShareButton.propTypes = {
  onSocialShare: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

export default SocialShareButton;
