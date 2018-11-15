import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styled from "react-emotion";
import mq from "../../../../media-queries";

import "./imagery.scss";

const LegacyImage = ({ ...props }) => {
  return (
    <img
      className={classNames("mapseed__image", props.classes)}
      src={props.src}
      alt={props.alt}
    />
  );
};

LegacyImage.propTypes = {
  alt: PropTypes.string.isRequired,
  classes: PropTypes.string,
  src: PropTypes.string.isRequired,
};

LegacyImage.defaultProps = {
  alt: "Untitled image",
};

const Image = props => <img src={props.src} alt={props.alt} {...props} />;

Image.propTypes = {
  alt: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

Image.defaultProps = {
  alt: "Untitled image",
};

const SiteLogo = styled(props => {
  return <img src={props.src} alt={props.alt} className={props.className} />;
})(props => ({
  [mq[0]]: {
    // TODO: mobile sizing...
  },
  [mq[1]]: {
    height: "56px", // 56 === header height (64px) - 2x micro spacing (8px)
    marginLeft: "8px",
  },
}));

SiteLogo.propTypes = {
  alt: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

const UserAvatar = styled(Image)(props => {
  // These styles correspond to the "regular" size in our design language.
  const styles = {
    width: "24px",
    height: "24px",
  };

  switch (props.size) {
    case "micro":
      styles.width = "8px";
      styles.height = "8px";
      break;
    case "small":
      styles.width = "16px";
      styles.height = "16px";
      break;
    case "large":
      styles.width = "48px";
      styles.height = "48px";
      break;
  }

  return styles;
});

UserAvatar.propTypes = {
  size: PropTypes.string,
  src: PropTypes.string.isRequired,
};

UserAvatar.defaultProps = {
  alt: "Mapseed user avatar",
  src: "/static/css/images/user-50.png",
};

export default UserAvatar;

export { LegacyImage, Image, UserAvatar, SiteLogo };
