import React from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";
import { Link } from "../atoms/typography";
import classNames from "classnames";
import LegacyUtil from "../../js/utils.js";

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
    const {
      slug: datasetSlug,
      owner: datasetOwner,
    } = this.props.datasetDownloadConfig;
    const isAdmin = LegacyUtil.getAdminStatus(datasetSlug);
    if (this.props.currentUser) {
      // If user is logged in
      return (
        <nav className="user-menu authed" role="article">
          <a href="#" id="sign-in-btn" onClick={this.toggleMenu}>
            <img
              className="avatar header-avatar"
              src={this.props.currentUser.avatar_url}
            />
          </a>
          <ul
            className={classNames("menu", "sign-in-menu", {
              "is-exposed": this.state.isMenuOpen,
            })}
          >
            {isAdmin && (
              <li style={{ paddingBottom: "16px" }}>
                <Link
                  href={`${
                    this.props.apiRoot
                  }${datasetOwner}/datasets/${datasetSlug}/mapseed-places.csv?format=csv&include_private=true&page_size=10000`}
                  classes={".btn-secondary"}
                  style={{ width: "100%", textDecoration: "none" }}
                >
                  {`Download Survey Data`}
                </Link>
              </li>
            )}
            <li>
              <span className="signed-in-as">{this.props.t("signedInAs")}</span>{" "}
              <span className="current-user">
                {this.props.currentUser.name}
              </span>
            </li>
            <li className="">
              <a
                className="logout-btn"
                href={`${this.props.apiRoot}users/logout/`}
              >
                {this.props.t("logOut")}
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
            {this.props.t("signIn")}
          </a>
          <ul
            className={classNames("menu", "sign-in-menu", {
              "is-exposed": this.state.isMenuOpen,
            })}
          >
            <li className="menu-item sign-in-menu-item">
              <a
                className="auth-btn google-btn"
                href={`${this.props.apiRoot}users/login/google-oauth2/`}
              >
                Google
              </a>
            </li>
            <li className="menu-item sign-in-menu-item">
              <a
                className="auth-btn twitter-btn"
                href={`${this.props.apiRoot}users/login/twitter/`}
              >
                Twitter
              </a>
            </li>
            <li className="menu-item sign-in-menu-item">
              <a
                className="auth-btn facebook-btn"
                href={`${this.props.apiRoot}users/login/facebook/`}
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
  datasetDownloadConfig: PropTypes.shape({
    owner: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  }),
  t: PropTypes.func.isRequired,
};

export default translate("UserMenu")(UserMenu);
