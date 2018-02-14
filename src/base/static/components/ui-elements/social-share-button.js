import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";

const Util = require("../../js/utils.js");

import "./social-share-button.scss";

const SocialShareButton = props => {
  return (
    <button
      className={classNames("social-share-button", {
        "social-share-button--twitter": props.type === "twitter",
        "social-share-button--facebook": props.type === "facebook",
      })}
      onClick={() => Util.onSocialShare(props.model, props.type)}
    />
  );
};

SocialShareButton.propTypes = {
  model: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
};

export default SocialShareButton;
