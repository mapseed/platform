/** @jsx jsx */
import React, { useState, useEffect } from "react";
import { css, jsx } from "@emotion/core";
import { withTheme } from "emotion-theming";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import mq from "../../../../media-queries";
import BarLoader from "react-spinners/BarLoader";

const Image = props => <img src={props.src} alt={props.alt} {...props} />;

Image.propTypes = {
  alt: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

Image.defaultProps = {
  alt: "Untitled image",
};

const FontAwesomeIcon = styled(props => (
  <span className={`${props.className} ${props.faClassname}`} />
))(props => {
  const styles = {
    fontFamily: "Font Awesome 5 Free",
    fontSize: props.fontSize,
    color: props.color,
    textShadow: props.textShadow,

    "&:hover": {
      color: props.hoverColor,
    },
  };

  return styles;
});

FontAwesomeIcon.propTypes = {
  color: PropTypes.string.isRequired,
  fontSize: PropTypes.string.isRequired,
  faClassname: PropTypes.string.isRequired,
  hoverColor: PropTypes.string.isRequired,
};

FontAwesomeIcon.defaultProps = {
  fontSize: "1rem",
  content: "fa fa-globe",
  color: "#000",
  hoverColor: "#555",
  textShadow: "initial",
};

const ProgressBar = withTheme(props => {
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        flex: 1;
        padding: 0 5px 0 5px;
        background-color: #eaeaea;
        height: 20px;
        border-radius: 10px;
      `}
    >
      <div
        css={css`
          height: 10px;
          border-radius: 5px;
          width: ${(props.currentProgress / props.total) * 100 + "%"};
          background-color: ${props.theme.brand.accent};
        `}
      />
    </div>
  );
});

ProgressBar.propTypes = {
  currentProgress: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};
const SiteLogo = styled(props => {
  return (
    <img
      id="mapseed-site-logo"
      src={props.src}
      alt={props.alt}
      className={props.className}
    />
  );
})(() => ({
  [mq[0]]: {
    maxWidth: "250px",
  },
  [mq[1]]: {
    height: "48px", // 48 === header height (56px) - 2x micro spacing (8px)
    marginLeft: "8px",
  },
}));

SiteLogo.propTypes = {
  alt: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

const UserAvatar = styled(props => {
  const [avatarSrc, setAvatarSrc] = useState(props.src);
  useEffect(() => setAvatarSrc(props.src), [props.src]);

  return (
    <Image
      alt={props.alt}
      src={avatarSrc}
      className={props.className}
      onError={() => setAvatarSrc("/static/css/images/user-50.png")}
      onClick={props.onClick}
    />
  );
})(props => {
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
  src: PropTypes.string,
  onClick: PropTypes.func,
};

UserAvatar.defaultProps = {
  alt: "Mapseed user avatar",
  src: "/static/css/images/user-50.png",
};

// TODO: Color this with the theme's accent color?
const Spinner = ({ size = 20, color = "#666" }) => (
  <div
    css={css`
      width: 100px;
      position: absolute;
      left: calc(50% - 50px);
      top: 50%;
    `}
  >
    <BarLoader sizeUnit="px" size={size} color={color} />
  </div>
);

export default UserAvatar;

export { Image, UserAvatar, SiteLogo, FontAwesomeIcon, Spinner, ProgressBar };
