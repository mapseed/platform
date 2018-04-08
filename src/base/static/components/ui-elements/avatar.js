import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./avatar.scss";

const UserAvatar = props => {
  return (
    <img
      className={classNames("user-avatar", props.className, {
        "user-avatar--large": props.size === "large",
        "user-avatar--small": props.size === "small",
      })}
      src={props.src}
    />
  );
};

UserAvatar.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string,
  src: PropTypes.string.isRequired,
};

UserAvatar.defaultProps = {
  size: "large",
  src: "/static/css/images/user-50.png",
};

export default UserAvatar;
