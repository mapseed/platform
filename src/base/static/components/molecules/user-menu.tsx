/** @jsx jsx */
import * as React from "react";
import { jsx, InterpolationWithTheme } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { UserAvatar } from "../atoms/imagery";
import { connect } from "react-redux";
import { InternalLink, ExternalLink, SmallText } from "../atoms/typography";
import OfflineDownloadMenu from "../organisms/offline-download-menu";
import styled from "@emotion/styled";

import { Mixpanel } from "../../utils/mixpanel";
import {
  DashboardsConfig,
  dashboardConfigSelector,
} from "../../state/ducks/dashboard-config";

import { hasAdminAbilities, User } from "../../state/ducks/user";
import { OfflineConfig, offlineConfigSelector } from "../../state/ducks/map";

import mq from "../../../../media-queries";
import { AppConfig } from "../../state/ducks/app-config";

type MenuContainerProps = {
  isMobileEnabled: boolean;
};
const MenuContainer = styled("nav")<MenuContainerProps>(props => ({
  marginLeft: "auto",
  marginRight: "8px",

  [mq[0]]: {
    display: props.isMobileEnabled ? "block" : "none",
    marginLeft: "auto",
    marginRight: "auto",
  },
  [mq[1]]: {
    display: "block",
  },
}));

const menuStyles = ({
  isMenuOpen,
  isLoggedIn,
}: {
  isMenuOpen: boolean;
  isLoggedIn: boolean;
  // using 'any' for Theme type, until our theme.js is ported over to TS:
}): InterpolationWithTheme<any> => ({
  textAlign: "center",
  float: "left",
  width: "100%",
  margin: "0.5em 0",
  padding: "0",
  display: isMenuOpen ? "grid" : "none",
  gridRowGap: "16px",
  listStyle: "none",

  [mq[1]]: {
    backgroundColor: "#fff",
    borderRadius: "3px",
    boxShadow: "-0.25em 0.25em 0 rgba(0, 0, 0, 0.2)",
    width: "18em",
    margin: "0",
    padding: "1em 0.875em 1.125em 0.875em",
    position: "absolute",
    top: "4.125em",
    right: "1em",
    zIndex: 2,

    "&:before": {
      content: '""',
      height: "0",
      width: "0",
      border: "1em solid transparent",
      borderBottomColor: "#666",
      borderTop: "0",
      position: "absolute",
      bottom: "100%",
      right: isLoggedIn ? "0.5em" : "1.5em",
    },
  },
});

const MenuItem = styled("li")(({ theme }) => ({
  float: "left",
  width: "100%",
  fontFamily: theme.text.navBarFontFamily,
}));

type StateProps = {
  hasAdminAbilities: Function;
  offlineBoundingBox: OfflineConfig;
  dashboardConfig: DashboardsConfig;
};

type Props = {
  currentUser: User;
  pathname: string;
  appConfig: AppConfig;
  isMobileEnabled: boolean;
  isInMobileMode: boolean;
} & StateProps;

const UserMenu: React.FunctionComponent<Props> = props => {
  const [isMenuToggled, setIsMenuToggled] = React.useState<boolean>(false);
  const isMenuOpen = isMenuToggled || props.isInMobileMode;

  const [t, _] = useTranslation();
  // If user is logged in
  const isDashboard = props.pathname === "/dashboard";
  return (
    <MenuContainer role="article" isMobileEnabled={props.isMobileEnabled}>
      {!props.isInMobileMode && (
        <UserAvatar
          css={{
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
              zIndex: 1,
            },
          }}
          alt="profile picture"
          onClick={() => setIsMenuToggled(isMenuOpen => !isMenuOpen)}
          src={props.currentUser.avatar_url}
        />
      )}
      <ul css={menuStyles({ isMenuOpen, isLoggedIn: true })}>
        {!!props.dashboardConfig.length &&
          props.hasAdminAbilities(props.dashboardConfig[0].datasetSlug) && (
            <MenuItem
              onClick={() => setIsMenuToggled(isMenuOpen => !isMenuOpen)}
            >
              <InternalLink href={isDashboard ? "/" : "/dashboard"}>
                {isDashboard ? "back to map" : `go to dashboard`}
              </InternalLink>
            </MenuItem>
          )}
        {props.offlineBoundingBox && (
          <MenuItem>
            <OfflineDownloadMenu
              offlineBoundingBox={props.offlineBoundingBox}
            />
          </MenuItem>
        )}
        <MenuItem>
          <div>
            <SmallText>{t("signedInAs", "Signed in as")}</SmallText>{" "}
            {props.currentUser.name}
          </div>
          <ExternalLink
            css={{
              fontSize: "0.875em",
              fontWeight: "normal",
              textDecoration: "none",
              textTransform: "uppercase",
              width: "100%",
            }}
            href={`${props.appConfig.api_root}users/logout/`}
            onClick={() => Mixpanel.track("Clicked logout button")}
          >
            {t("logOut", "Log out")}
          </ExternalLink>
        </MenuItem>
      </ul>
    </MenuContainer>
  );
};

const mapStateToProps = (state: any): StateProps => ({
  hasAdminAbilities: datasetSlug => hasAdminAbilities(state, datasetSlug),
  offlineBoundingBox: offlineConfigSelector(state),
  dashboardConfig: dashboardConfigSelector(state),
});

export default connect(mapStateToProps)(UserMenu);
