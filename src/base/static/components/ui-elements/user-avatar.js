import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./user-avatar.scss";

const UserAvatar = props => {
  return (
    <img
      className={classNames("user-avatar", props.className)}
      src={props.src}
    />
  );
};

UserAvatar.propTypes = {
  className: PropTypes.string,
  src: PropTypes.string.isRequired,
};

UserAvatar.defaultProps = {
  src: "/static/css/images/user-50.png",
};

export default UserAvatar;
