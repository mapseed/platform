/** @jsx jsx */
import * as React from "react";
import PropTypes from "prop-types";
import { jsx } from "@emotion/core";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import { Link, SmallText, RegularText } from "../atoms/typography";
import { Button } from "../atoms/buttons";
import OfflineDownloadMenu from "../organisms/offline-download-menu";
import styled from "@emotion/styled";
import { dashboardConfigPropType } from "../../state/ducks/dashboard-config";
import {
  offlineConfigSelector,
  offlineConfigPropType,
  mapLayersSelector,
} from "../../state/ducks/map-config";

import {
  userSelector,
  userPropType,
  hasAdminAbilities,
} from "../../state/ducks/user";

import mq from "../../../../media-queries";

const MenuContainer = styled("nav")(props => ({
  marginLeft: "auto",
  marginRight: "10px",

  [mq[0]]: {
    display: props.isMobileEnabled ? "block" : "none",
    marginLeft: "auto",
    marginRight: "auto",
  },
  [mq[1]]: {
    display: "block",
  },
}));

const avatarImgStyles = {
  float: "right",
  width: "2.7em",
  height: "2.6em",
  maxWidth: "none",
  cursor: "pointer",

  fontSize: "1em",
  padding: "0",
  outline: "0",

  [mq[0]]: {
    display: "none",
  },

  [mq[1]]: {
    zIndex: "1",
  },
};

const MenuButton = styled(props => {
  return (
    <Button color="primary" className={props.classname} onClick={props.onClick}>
      {props.children}
    </Button>
  );
})(props => ({
  fontFamily: props.theme.text.navBarFontFamily,
  fontSize: "0.75em",
  textAlign: "center",
  textDecoration: "none",
  lineHeight: "3.25",
  display: "block",
  padding: "0 0.5em",
  height: "100%",
  cursor: "pointer",

  [mq[0]]: {
    display: "none",
  },

  [mq[1]]: {
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
  listStyle: "none",

  [mq[1]]: {
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

const MobileSigninLabelWrapper = styled("div")({
  width: "100%",
  display: "flex",
  justifyContent: "center",
});

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

class UserMenu extends React.Component {
  render() {
    if (this.props.currentUser.isAuthenticated) {
      // If user is logged in
      const isDashboard = this.props.currentTemplate === "dashboard";
      return (
        <MenuContainer
          role="article"
          isMobileEnabled={this.props.isMobileEnabled}
        >
          {!this.props.isInMobileMode && (
            <img
              css={avatarImgStyles}
              alt="user profile picture"
              onClick={this.props.toggleMenu}
              src={this.props.currentUser.avatar_url}
            />
          )}
          <Menu isMenuOpen={this.props.isMenuOpen} isLoggedIn={true}>
            <MenuItem onClick={this.props.toggleMenu}>
              {this.props.dashboardConfig.length &&
                this.props.hasAdminAbilities(
                  this.props.dashboardConfig[0].datasetSlug,
                ) && (
                  <Link rel="internal" href={isDashboard ? "/" : "/dashboard"}>
                    {isDashboard ? "back to map" : `go to dashboard`}
                  </Link>
                )}
            </MenuItem>
            <MenuItem>
              {this.props.offlineBoundingBox && (
                <OfflineDownloadMenu
                  offlineBoundingBox={this.props.offlineBoundingBox}
                  mapLayerConfigs={this.props.mapLayerConfigs}
                />
              )}
            </MenuItem>
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
        <MenuContainer
          role="article"
          isMobileEnabled={this.props.isMobileEnabled}
        >
          {this.props.isInMobileMode ? (
            <MobileSigninLabelWrapper>
              <RegularText
                color="tertiary"
                height="24px"
                weight="bold"
                textTransform="uppercase"
              >{`Sign In:`}</RegularText>
            </MobileSigninLabelWrapper>
          ) : (
            <MenuButton onClick={this.props.toggleMenu}>
              {this.props.t("signIn")}
            </MenuButton>
          )}
          <Menu isMenuOpen={this.props.isMenuOpen}>
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
  currentUser: userPropType,
  dashboardConfig: dashboardConfigPropType,
  offlineBoundingBox: offlineConfigPropType,
  mapLayerConfigs: PropTypes.array,
  hasAdminAbilities: PropTypes.func.isRequired,
  currentTemplate: PropTypes.string.isRequired,
  apiRoot: PropTypes.string.isRequired,
  router: PropTypes.instanceOf(Backbone.Router),
  t: PropTypes.func.isRequired,
  isMobileEnabled: PropTypes.bool.isRequired,
  isInMobileMode: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  isMenuOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  currentUser: userSelector(state),
  hasAdminAbilities: datasetSlug => hasAdminAbilities(state, datasetSlug),
  offlineBoundingBox: offlineConfigSelector(state),
  mapLayerConfigs: mapLayersSelector(state),
});

export default connect(mapStateToProps)(translate("UserMenu")(UserMenu));
