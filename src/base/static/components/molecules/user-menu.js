import React from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";
import classNames from "classnames";

class UserMenu extends React.Component {
  state = {
    isMenuOpen: false,
  };

  toggleMenu = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        isMenuOpen: !prevState.isMenuOpen,
      };
    });
  };

  render() {
    const { apiRoot, t, currentUser } = this.props;
    if (currentUser) {
      // If user is logged in
      return (
        <nav className="user-menu authed" role="article">
          <a href="#" id="sign-in-btn" onClick={this.toggleMenu}>
            <img
              className="avatar header-avatar"
              src="{currentUser.avatar_url}}"
            />
          </a>
          <ul
            className={classNames("menu", "sign-in-menu", {
              "is-exposed": this.state.isMenuOpen,
            })}
          >
            <li>
              <span className="signed-in-as">{t("signedInAs")}</span>{" "}
              <span className="current-user">{currentUser.name}</span>
            </li>
            <li className="">
              <a className="logout-btn" href={`${apiRoot}users/logout/`}>
                {t("logOut")}
              </a>
            </li>
          </ul>
        </nav>
      );
    } else {
      // If no user is logged in
      return (
        <nav className="user-menu" role="article">
          <a href="#" id="sign-in-btn" onClick={this.toggleMenu}>
            {t("signIn")}
          </a>
          <ul
            className={classNames("menu", "sign-in-menu", {
              "is-exposed": this.state.isMenuOpen,
            })}
          >
            <li className="menu-item sign-in-menu-item">
              <a
                className="auth-btn google-btn"
                href={`${apiRoot}users/login/google-oauth2/`}
              >
                Google
              </a>
            </li>
            <li className="menu-item sign-in-menu-item">
              <a
                className="auth-btn twitter-btn"
                href={`${apiRoot}users/login/twitter/`}
              >
                Twitter
              </a>
            </li>
            <li className="menu-item sign-in-menu-item">
              <a
                className="auth-btn facebook-btn"
                href={`${apiRoot}users/login/facebook/`}
              >
                Facebook
              </a>
            </li>
          </ul>
        </nav>
      );
    }
  }
}

UserMenu.propTypes = {
  currentUser: PropTypes.object,
  apiRoot: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate("UserImage")(UserMenu);
