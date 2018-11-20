import React from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";
import { Link, SmallText } from "../atoms/typography";
import { Button } from "../atoms/buttons";
import LegacyUtil from "../../js/utils.js";
import styled from "react-emotion";

import mq from "../../../../media-queries";

const MenuContainer = styled("nav")({
  marginLeft: "auto",
  marginRight: "10px",

  [mq[0]]: {
    display: "none",
  },
  [mq[1]]: {
    display: "block",
  },
});

const AvatarImg = styled("img")({
  float: "right",
  width: "2.7em",
  height: "2.6em",
  maxWidth: "none",
  cursor: "pointer",

  fontSize: "1em",
  padding: "0",
  outline: "0",

  "@media only screen and (min-width: 60em)": {
    zIndex: "1",
  },
});

const MenuButton = styled(props => {
  return (
    <Button
      color="primary"
      className={props.classname}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
})(() => ({
  fontSize: "0.75em",
  textAlign: "center",
  textDecoration: "none",
  lineHeight: "3.25",
  display: "block",
  padding: "0 0.5em",
  height: "100%",
  cursor: "pointer",

  "@media only screen and (min-width: 60em)": {
    fontSize: "1em",
    textDecoration: "none",
    lineHeight: "1.5",
    padding: "0.5em",
    position: "relative",
    zIndex: "3",
  },
}));

const LogoutButton = styled(Link)({
  fontSize: "0.875em",
  fontWeight: "normal",
  textDecoration: "none",
  textTransform: "uppercase",
  width: "100%",
});

const Menu = styled("ul")(props => ({
  textAlign: "center",
  float: "left",
  width: "100%",
  margin: "0.5em 0",
  padding: "0",
  display: props.isMenuOpen ? "grid" : "none",
  gridRowGap: "16px",

  "@media only screen and (min-width: 60em)": {
    background: "url(/static/css/images/lightpaperfibers.png)",
    borderRadius: "3px",
    boxShadow: "-0.25em 0.25em 0 rgba(0, 0, 0, 0.2)",
    width: "18em",
    margin: "0",
    padding: "1em 0.875em 1.125em 0.875em",
    position: "absolute",
    top: "4.125em",
    right: "1em",
    zIndex: "2",

    "&:before": {
      content: '""',
      height: "0",
      width: "0",
      border: "1em solid transparent",
      borderBottomColor: "#666",
      borderTop: "0",
      position: "absolute",
      bottom: "100%",
      right: props.isLoggedIn ? "0.5em" : "1.5em",
    },
  },
}));

const MenuItem = styled("li")(({ theme }) => ({
  float: "left",
  width: "100%",
  fontFamily: theme.text.fontFamily,
}));

const SocialMediaMenuItem = styled(MenuItem)({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gridRowGap: "8px",
  gridColumnGap: "8px",
});

const SocialLoginButton = styled(Link)(props => {
  let backgroundColor;
  switch (props.service) {
    case "twitter":
      backgroundColor = "#4099ff";
      break;
    case "facebook":
      backgroundColor = "#3b5998";
      break;
    case "google":
      backgroundColor = "#e8433a";
      break;
  }
  return {
    display: "block",
    padding: "0.5em",
    boxShadow: props.theme.boxShadow,
    color: "#fff !important",
    backgroundColor,
  };
});

const DownloadDataLink = styled(Link)({
  textDecoration: "none",
});

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
    if (this.props.currentUser) {
      // If user is logged in
      return (
        <MenuContainer role="article">
          <AvatarImg
            onClick={this.toggleMenu}
            src={this.props.currentUser.avatar_url}
          />
          <Menu isMenuOpen={this.state.isMenuOpen} isLoggedIn={true}>
            {this.props.datasetDownloadConfig &&
              LegacyUtil.getAdminStatus(
                this.props.datasetDownloadConfig.slug,
              ) && (
                <MenuItem>
                  <DownloadDataLink
                    href={`${this.props.apiRoot}${
                      this.props.datasetDownloadConfig.owner
                    }/datasets/${
                      this.props.datasetDownloadConfig.slug
                    }/mapseed-places.csv?format=csv&include_private=true&page_size=10000`}
                  >
                    {`Download Survey Data`}
                  </DownloadDataLink>
                </MenuItem>
              )}
            <MenuItem>
              <div>
                <SmallText>{this.props.t("signedInAs")}</SmallText>{" "}
                {this.props.currentUser.name}
              </div>
              <LogoutButton href={`${this.props.apiRoot}users/logout/`}>
                {this.props.t("logOut")}
              </LogoutButton>
            </MenuItem>
          </Menu>
        </MenuContainer>
      );
    } else {
      // If no user is logged in
      return (
        <MenuContainer role="article">
          <MenuButton onClick={this.toggleMenu}>
            {this.props.t("signIn")}
          </MenuButton>
          <Menu isMenuOpen={this.state.isMenuOpen}>
            <SocialMediaMenuItem>
              <SocialLoginButton
                service={"google"}
                href={`${this.props.apiRoot}users/login/google-oauth2/`}
              >
                Google
              </SocialLoginButton>
              <SocialLoginButton
                service={"twitter"}
                href={`${this.props.apiRoot}users/login/twitter/`}
              >
                Twitter
              </SocialLoginButton>
              <SocialLoginButton
                service={"facebook"}
                href={`${this.props.apiRoot}users/login/facebook/`}
              >
                Facebook
              </SocialLoginButton>
            </SocialMediaMenuItem>
          </Menu>
        </MenuContainer>
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
