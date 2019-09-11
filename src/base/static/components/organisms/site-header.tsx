/** @jsx jsx */
import * as React from "react";
import PropTypes from "prop-types";
import styled from "../../utils/styled";
import { connect } from "react-redux";
import { jsx } from "@emotion/core";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { withTranslation, WithTranslation } from "react-i18next";

import { SiteLogo } from "../atoms/imagery";
import { NavButton } from "../molecules/buttons";
import { Button } from "../atoms/buttons";
import UserMenu from "../molecules/user-menu";
import LoginMenu from "../molecules/login-menu";
import { RegularTitle, InternalLink, ExternalLink } from "../atoms/typography";

import {
  NavBarConfig,
  navBarConfigSelector,
} from "../../state/ducks/nav-bar-config";
import PlaceFilterMenu from "./place-filter-menu";
import { appConfigSelector, AppConfig } from "../../state/ducks/app-config";
import { mapConfigSelector, MapConfig } from "../../state/ducks/map";
import { currentTemplateSelector, resetUi } from "../../state/ducks/ui";
import {
  isLeftSidebarExpandedSelector,
  setLeftSidebarExpanded,
} from "../../state/ducks/left-sidebar";
import mq from "../../../../media-queries";
import eventEmitter from "../../utils/event-emitter";
import { userSelector, User } from "../../state/ducks/user";

type NavButtonProps = {
  position: number;
};
const NavButtonWrapper = styled("div")<NavButtonProps>(props => ({
  [mq[1]]: {
    alignItems: "center",
    borderLeft:
      props.position > 0 ? `solid 1px ${props.theme.text.tertiary}` : "none",
  },
}));

const NavLink = styled(props => {
  let LinkType;
  let target;
  switch (props.type) {
    case "external":
      LinkType = ExternalLink;
      target = "_blank";
      break;
    case "internal":
    default:
      LinkType = InternalLink;
      target = "_self";
      break;
  }

  return (
    <NavButtonWrapper position={props.position}>
      <LinkType
        target={target}
        className={props.className}
        href={props.href}
        style={{ padding: "4px 8px 4px 8px" }}
      >
        {props.children}
      </LinkType>
    </NavButtonWrapper>
  );
})(props => ({
  // TODO: Many of these style rules should eventually be moved to the Link atom.
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  textTransform: "uppercase",
  fontSize: "0.9rem",
  fontFamily: props.theme.text.navBarFontFamily,
  fontWeight: 600,
  color: props.theme.bg.light,
  marginRight: "4px",
  marginLeft: "4px",
  borderRadius: "3px",
  height: props.height,

  "&:hover": {
    color: props.theme.text.secondary,
    backgroundColor: props.theme.brand.accent,
  },
  [mq[0]]: {
    textAlign: "center",
  },
}));

const SiteTitle = styled(RegularTitle)(props => ({
  color: props.theme.text.titleColor,
  fontFamily: props.theme.text.titleFontFamily,
  margin: 0,
  marginLeft: "15px",
  letterSpacing: "1px",

  [mq[0]]: {
    // NOTE: This is an override of our RegularTitle font size.
    fontSize: "1rem",
  },
}));

const navItemMappings = {
  // eslint-disable-next-line react/display-name
  internal_link: linkProps => (
    <NavLink
      type="internal"
      height="24px"
      position={linkProps.position}
      href={linkProps.navBarItem.url}
      ariaLabel={`navigate to: ${linkProps.navBarItem.title}`}
    >
      {linkProps.children}
    </NavLink>
  ),
  // eslint-disable-next-line react/display-name
  external_link: linkProps => (
    <NavLink
      type="external"
      height="24px"
      position={linkProps.position}
      href={linkProps.navBarItem.url}
      ariaLabel={`navigate to: ${linkProps.navBarItem.title}`}
    >
      {linkProps.children}
    </NavLink>
  ),
  // eslint-disable-next-line react/display-name
  left_sidebar_toggle: linkProps => (
    <NavButtonWrapper position={linkProps.position}>
      <NavButton
        color={"secondary"}
        ariaLabel={`open the ${linkProps.navBarItem.title} menu`}
        onClick={() => {
          linkProps.onClick();
          linkProps.setLeftSidebarExpanded(!linkProps.isLeftSidebarExpanded);
        }}
      >
        {linkProps.children}
      </NavButton>
    </NavButtonWrapper>
  ),
  list_toggle: styled(linkProps => (
    <InternalLink
      className={linkProps.className}
      aria-label={
        linkProps.pathname === "/list" || linkProps.pathname === "/dashboard"
          ? "view as a map"
          : "view as a list"
      }
      href={
        linkProps.pathname === "/dashboard" || linkProps.pathname === "/list"
          ? "/"
          : "/list"
      }
      css={theme => ({
        // TODO: Many of these style rules should eventually be moved to the Link atom.
        fontFamily: theme.text.navBarFontFamily,
        fontWeight: 600,
        fontSize: "0.9rem",
        textTransform: "uppercase",
        textDecoration: "none",
        color: theme.text.secondary,
        padding: "0.5rem",
        backgroundColor: theme.brand.primary,
        borderRadius: "3px",
        border: "3px solid rgba(0, 0, 0, 0.05)",
        boxShadow: "rgba(0, 0, 0, 0.1) -0.25em 0.25em 2px",

        "&:hover": {
          backgroundColor: theme.brand.accent,
        },

        "&:active": {
          boxShadow: "none",
          transform: "translate(-0.1em, 0.1em)",
        },
      })}
    >
      {linkProps.t(
        linkProps.pathname === "/list" || linkProps.pathname === "/dashboard"
          ? "toggleMapButton"
          : "toggleListButton",
        linkProps.pathname === "/list" || linkProps.pathname === "/dashboard"
          ? linkProps.navBarItem.show_map_button_label
          : linkProps.navBarItem.show_list_button_label,
      )}
    </InternalLink>
  ))(() => ({
    [mq[0]]: {
      display: "none",
    },
    [mq[1]]: {
      display: "block",
    },
  })),
  filter: PlaceFilterMenu,
};

type ComponentPropTypes = {
  navBarConfig: NavBarConfig;
};

type DispatchProps = {
  setLeftSidebarExpanded: Function;
  resetUi: Function;
};

// NOTE: copy/pasted from App component
interface Language {
  code: string;
  label: string;
}

type Props = {
  appConfig: AppConfig;
  currentLanguageCode: string;
  currentTemplate: string;
  currentUser: User;
  isLeftSidebarExpanded: boolean;
  onChangeLanguage: Function;
  mapConfig: MapConfig;
  setLeftSidebarExpanded: Function;
  resetUi: Function;
  defaultLanguage: Language;
  availableLanguages?: Language[];
} & ComponentPropTypes &
  DispatchProps &
  RouteComponentProps<{}> &
  WithTranslation;

const SiteHeader: React.FunctionComponent<Props> = props => {
  const [isLanguageMenuVisible, setIsLanguageMenuVisible] = React.useState<
    boolean
  >(false); // relevant on desktop layouts

  // hack to expand the header on mobile layouts, to accommodate a side menu drawer:
  const [isMobileHeaderExpanded, setIsMobileHeaderExpanded] = React.useState<
    boolean
  >(false);

  const defaultMapViewport = props.mapConfig.defaultMapViewport;
  return (
    <header
      css={theme => ({
        position: "relative",
        zIndex: 25,
        backgroundColor: theme.bg.default,
        display: "flex",
        height: isMobileHeaderExpanded ? "auto" : "56px",
        alignItems: "center",
        boxShadow: "0 2px 0 rgba(0,0,0,0.2)",
        boxSizing: "border-box",

        [mq[0]]: {
          flexDirection: "column",
          padding: "8px",
        },
        [mq[1]]: {
          flexDirection: "row",
        },
      })}
    >
      <div
        css={{
          display: "flex",
          alignItems: "center",

          [mq[0]]: {
            width: "100%",
          },
        }}
      >
        <i
          className="fa fa-bars"
          onClick={() => {
            setIsMobileHeaderExpanded(prevState => !prevState);
          }}
          css={{
            fontSize: "20px",
            margin: "0 8px 0 8px",
            fontFamily: '"Font Awesome 5 Free"',
            "&:hover": {
              cursor: "pointer",
            },

            [mq[1]]: {
              display: "none",
            },
          }}
        />
        <InternalLink
          href={`/${defaultMapViewport.zoom.toFixed(
            1,
          )}/${defaultMapViewport.latitude.toFixed(
            5,
          )}/${defaultMapViewport.longitude.toFixed(5)}`}
          onClick={() => {
            eventEmitter.emit("setMapViewport", defaultMapViewport);
            props.resetUi();
          }}
          css={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",

            [mq[0]]: {
              width: "100%",
            },
          }}
        >
          {props.appConfig.logo && (
            <SiteLogo src={props.appConfig.logo} alt={props.appConfig.name} />
          )}
          {props.appConfig.show_name_in_header && (
            <SiteTitle>{props.t("siteTitle", props.appConfig.name)}</SiteTitle>
          )}
        </InternalLink>
      </div>
      <nav
        aria-label="navigation header"
        css={{
          [mq[0]]: {
            display: isMobileHeaderExpanded ? "flex" : "none",
            flexDirection: "column",
            width: "100%",
            marginTop: "16px",
            alignItems: "stretch",
          },
          [mq[1]]: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginLeft: "25px",
          },
        }}
      >
        {props.navBarConfig.map((navBarItem, i) => {
          const NavItemComponent = navItemMappings[navBarItem.type];
          return (
            <NavItemComponent
              key={i}
              position={i}
              navBarItem={navBarItem}
              currentTemplate={props.currentTemplate}
              setLeftSidebarExpanded={props.setLeftSidebarExpanded}
              isLeftSidebarExpanded={props.isLeftSidebarExpanded}
              pathname={props.history.location.pathname}
              onClick={() => {
                setIsMobileHeaderExpanded(false);
              }}
              t={props.t}
            >
              {props.t(`navBarItem${i}`, navBarItem.title)}
            </NavItemComponent>
          );
        })}
      </nav>
      <div
        css={{
          alignItems: "center",

          [mq[0]]: {
            display: isMobileHeaderExpanded ? "flex" : "none",
            marginLeft: 0,
            width: "100%",
            flexDirection: "column",
          },
          [mq[1]]: {
            display: "flex",
            marginLeft: "auto",
          },
        }}
      >
        {props.availableLanguages && (
          <nav
            onMouseOver={() => setIsLanguageMenuVisible(true)}
            onMouseOut={() => setIsLanguageMenuVisible(false)}
            css={theme => ({
              color: theme.bg.light,
              fontWeight: 600,
              textTransform: "uppercase",
              fontSize: "0.9rem",
              fontFamily: theme.text.navBarFontFamily,
              "&:hover": {
                cursor: "pointer",
              },

              [mq[0]]: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                marginTop: "16px",
                marginRight: 0,
              },
              [mq[1]]: {
                marginRight: "16px",
              },
            })}
          >
            {
              props.availableLanguages
                .concat(props.defaultLanguage)
                .find(lang => lang.code === props.currentLanguageCode)!.label
            }{" "}
            ⌄
            <ul
              css={theme => ({
                zIndex: 100,
                backgroundColor: theme.bg.default,
                listStyle: "none",
                padding: 0,
                margin: 0,

                [mq[0]]: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  marginTop: "8px",
                },
                [mq[1]]: {
                  display: isLanguageMenuVisible ? "block" : "none",
                  position: "fixed",
                  border: `4px solid ${theme.brand.accent}`,
                },
              })}
            >
              {props.availableLanguages
                .concat(props.defaultLanguage)
                .map(lang => (
                  <li
                    key={lang.code}
                    css={{
                      [mq[0]]: {
                        display: "flex",
                        width: "100%",
                      },

                      [mq[1]]: {
                        margin: "4px 0",
                      },
                    }}
                  >
                    <Button
                      onClick={() => {
                        props.onChangeLanguage(lang.code);
                      }}
                      css={theme => ({
                        fontFamily: theme.text.headerBarFontFamily,
                        fontSize: "1rem",
                        textTransform: "none",
                        textDecoration: "none",
                        width: "100%",
                        borderRadius: 0,

                        "&:hover": {
                          color: theme.text.secondary,
                          backgroundColor: theme.bg.highlighted,
                          cursor: "pointer",
                        },

                        [mq[0]]: {
                          width: "100%",
                        },
                      })}
                    >
                      {lang.label}
                    </Button>
                  </li>
                ))}
            </ul>
          </nav>
        )}
        {props.currentUser.isAuthenticated ? (
          <UserMenu
            appConfig={props.appConfig}
            currentUser={props.currentUser}
            isInMobileMode={isMobileHeaderExpanded}
            isMobileEnabled={!!props.appConfig.isShowingMobileUserMenu}
            pathname={props.history.location.pathname}
          />
        ) : (
          <LoginMenu
            appConfig={props.appConfig}
            isMobileHeaderExpanded={isMobileHeaderExpanded}
          />
        )}
      </div>
    </header>
  );
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  currentTemplate: currentTemplateSelector(state),
  currentUser: userSelector(state),
  isLeftSidebarExpanded: isLeftSidebarExpandedSelector(state),
  mapConfig: mapConfigSelector(state),
  navBarConfig: navBarConfigSelector(state),
});

const mapDispatchToProps = {
  setLeftSidebarExpanded,
  resetUi,
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withTranslation("SiteHeader")(SiteHeader)),
);
