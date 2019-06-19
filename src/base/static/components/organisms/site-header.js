/** @jsx jsx */
import * as React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { connect } from "react-redux";
import { jsx } from "@emotion/core";
import { withRouter } from "react-router-dom";
import { translate } from "react-i18next";

import { SiteLogo } from "../atoms/imagery";
import { NavButton } from "../molecules/buttons";
import { Button } from "../atoms/buttons";
import UserMenu from "../molecules/user-menu";
import { RegularTitle, InternalLink } from "../atoms/typography";

import {
  navBarConfigPropType,
  navBarConfigSelector,
} from "../../state/ducks/nav-bar-config";
import FilterMenu from "./filter-menu";
import {
  appConfigSelector,
  appConfigPropType,
} from "../../state/ducks/app-config";
import {
  mapConfigSelector,
  mapConfigPropType,
} from "../../state/ducks/map-config";
import {
  dashboardConfigSelector,
  dashboardConfigPropType,
} from "../../state/ducks/dashboard-config";
import { currentTemplateSelector, resetUi } from "../../state/ducks/ui";
import {
  isLeftSidebarExpandedSelector,
  setLeftSidebarComponent,
  setLeftSidebarExpanded,
} from "../../state/ducks/left-sidebar";
import mq from "../../../../media-queries";

const SiteHeaderWrapper = styled("header")(props => ({
  position: "relative",
  zIndex: 25,
  backgroundColor: props.theme.bg.default,
  display: "flex",
  height: props.isHeaderExpanded ? "auto" : "56px",
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
}));

const HamburgerTitleWrapper = styled("div")({
  display: "flex",
  alignItems: "center",

  [mq[0]]: {
    width: "100%",
  },
});

const navContainerStyles = props => ({
  [mq[0]]: {
    display: props.isHeaderExpanded ? "flex" : "none",
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
});

const ListToggleLink = styled(props => (
  <InternalLink
    href={props.href}
    className={props.className}
    aria-label={props.ariaLabel}
  >
    {props.children}
  </InternalLink>
))(props => ({
  // TODO: Many of these style rules should eventually be moved to the Link atom.
  fontFamily: props.theme.text.navBarFontFamily,
  fontWeight: 600,
  fontSize: "0.9rem",
  textTransform: "uppercase",
  textDecoration: "none",
  color: props.theme.text.secondary,
  padding: "0.5rem",
  backgroundColor: props.theme.brand.primary,
  borderRadius: "3px",
  border: "3px solid rgba(0, 0, 0, 0.05)",
  boxShadow: "rgba(0, 0, 0, 0.1) -0.25em 0.25em 2px",

  "&:hover": {
    backgroundColor: props.theme.brand.accent,
  },

  "&:active": {
    boxShadow: "none",
    transform: "translate(-0.1em, 0.1em)",
  },
}));

const NavButtonWrapper = styled("div")(props => ({
  [mq[1]]: {
    alignItems: "center",
    borderLeft:
      props.position > 0 ? `solid 1px ${props.theme.text.tertiary}` : "none",
  },
}));

const NavLink = styled(props => (
  <NavButtonWrapper position={props.position}>
    <InternalLink
      className={props.className}
      href={props.href}
      style={{ padding: "4px 8px 4px 8px" }}
    >
      {props.children}
    </InternalLink>
  </NavButtonWrapper>
))(props => ({
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

const LanguagePickerMenu = styled("ul")(props => ({
  backgroundColor: props.theme.bg.default,
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
    display: props.isLanguageMenuVisible ? "block" : "none",
    position: "fixed",
    border: `4px solid ${props.theme.brand.accent}`,
  },
}));

const LanguagePickerMenuItem = styled("li")({
  [mq[0]]: {
    display: "flex",
    width: "100%",
  },

  [mq[1]]: {
    margin: "4px 0",
  },
});

const LanguagePicker = styled("nav")(props => ({
  textTransform: "uppercase",
  fontSize: "0.9rem",
  fontFamily: props.theme.text.navBarFontFamily,
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
}));

const LanguageButton = styled(Button)(props => ({
  fontFamily: props.theme.text.headerBarFontFamily,
  fontSize: "1rem",
  textDecoration: "none",
  width: "100%",
  borderRadius: 0,

  "&:hover": {
    color: props.theme.text.secondary,
    backgroundColor: props.theme.bg.highlighted,
    cursor: "pointer",
  },

  [mq[0]]: {
    width: "100%",
  },
}));

const RightAlignedContainer = styled("div")(props => ({
  alignItems: "center",

  [mq[0]]: {
    display: props.isHeaderExpanded ? "flex" : "none",
    marginLeft: 0,
    width: "100%",
    flexDirection: "column",
  },
  [mq[1]]: {
    display: "flex",
    marginLeft: "auto",
  },
}));

const NavBarHamburger = styled("i")({
  fontSize: "20px",
  margin: "0 8px 0 8px",
  "&:hover": {
    cursor: "pointer",
  },
  "&:before": {
    fontStyle: "normal",
    fontFamily: "FontAwesome",
    content: "'\f0c9'",
  },

  [mq[1]]: {
    display: "none",
  },
});

const navItemMappings = {
  // eslint-disable-next-line react/display-name
  internal_link: linkProps => (
    <NavLink
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
        color={"tertiary"}
        ariaLabel={`open the ${linkProps.navBarItem.title} menu`}
        onClick={() => {
          linkProps.onClick();
          linkProps.setLeftSidebarComponent(linkProps.navBarItem.component);
          linkProps.setLeftSidebarExpanded(!linkProps.isLeftSidebarExpanded);
        }}
      >
        {linkProps.children}
      </NavButton>
    </NavButtonWrapper>
  ),
  list_toggle: styled(linkProps => (
    <ListToggleLink
      className={linkProps.className}
      ariaLabel={
        linkProps.pathname === "/list" || linkProps.pathname === "/dashboard"
          ? "view as a map"
          : "view as a list"
      }
      href={
        linkProps.pathname === "/dashboard" || linkProps.pathname === "/list"
          ? "/"
          : "/list"
      }
    >
      {linkProps.t(
        linkProps.pathname === "/list" || linkProps.pathname === "/dashboard"
          ? "toggleMapButton"
          : "toggleListButton",
        linkProps.pathname === "/list" || linkProps.pathname === "/dashboard"
          ? linkProps.navBarItem.show_map_button_label
          : linkProps.navBarItem.show_list_button_label,
      )}
    </ListToggleLink>
  ))(() => ({
    [mq[0]]: {
      display: "none",
    },
    [mq[1]]: {
      display: "block",
    },
  })),
  filter: FilterMenu,
};

class SiteHeader extends React.Component {
  state = {
    isLanguageMenuVisible: false, // relevant on desktop layouts
    isHeaderExpanded: false, // relevant on mobile layouts
    isUserMenuOpen: false,
  };

  toggleUserMenu = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        isUserMenuOpen: !prevState.isUserMenuOpen,
      };
    });
  };

  render() {
    const viewport = this.props.mapConfig.defaultMapViewport;
    return (
      <SiteHeaderWrapper isHeaderExpanded={this.state.isHeaderExpanded}>
        <HamburgerTitleWrapper>
          <NavBarHamburger
            onClick={() => {
              this.setState({
                isHeaderExpanded: !this.state.isHeaderExpanded,
              });
            }}
          />
          <InternalLink
            href={`/${viewport.zoom.toFixed(1)}/${viewport.latitude.toFixed(
              5,
            )}/${viewport.longitude.toFixed(5)}`}
            onClick={() => {
              this.props.resetUi();
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
            {this.props.appConfig.logo && (
              <SiteLogo
                src={this.props.appConfig.logo}
                alt={this.props.appConfig.name}
              />
            )}
            {this.props.appConfig.show_name_in_header && (
              <SiteTitle>
                {this.props.t("siteTitle", this.props.appConfig.name)}
              </SiteTitle>
            )}
          </InternalLink>
        </HamburgerTitleWrapper>
        <nav
          aria-label="navigation header"
          css={navContainerStyles({
            isHeaderExpanded: this.state.isHeaderExpanded,
          })}
        >
          {this.props.navBarConfig.map((navBarItem, i) => {
            const NavItemComponent = navItemMappings[navBarItem.type];
            return (
              <NavItemComponent
                key={i}
                position={i}
                navBarItem={navBarItem}
                currentTemplate={this.props.currentTemplate}
                setLeftSidebarComponent={this.props.setLeftSidebarComponent}
                setLeftSidebarExpanded={this.props.setLeftSidebarExpanded}
                isLeftSidebarExpanded={this.props.isLeftSidebarExpanded}
                pathname={this.props.history.location.pathname}
                onClick={() => {
                  this.setState({
                    isHeaderExpanded: false,
                  });
                }}
                t={this.props.t}
              >
                {this.props.t(`navBarItem${i}`, navBarItem.title)}
              </NavItemComponent>
            );
          })}
        </nav>
        <RightAlignedContainer isHeaderExpanded={this.state.isHeaderExpanded}>
          {this.props.availableLanguages && (
            <LanguagePicker
              onMouseOver={() =>
                this.setState({
                  isLanguageMenuVisible: true,
                })
              }
              onMouseOut={() =>
                this.setState({
                  isLanguageMenuVisible: false,
                })
              }
            >
              {
                this.props.availableLanguages
                  .concat(this.props.defaultLanguage)
                  .find(lang => lang.code === this.props.currentLanguageCode)
                  .label
              }{" "}
              ⌄
              <LanguagePickerMenu
                isLanguageMenuVisible={this.state.isLanguageMenuVisible}
              >
                {this.props.availableLanguages
                  .concat(this.props.defaultLanguage)
                  .map(lang => (
                    <LanguagePickerMenuItem key={lang.code}>
                      <LanguageButton
                        onClick={() => {
                          this.props.onChangeLanguage(lang.code);
                        }}
                      >
                        {lang.label}
                      </LanguageButton>
                    </LanguagePickerMenuItem>
                  ))}
              </LanguagePickerMenu>
            </LanguagePicker>
          )}
          <UserMenu
            apiRoot={this.props.appConfig.api_root}
            isInMobileMode={this.state.isHeaderExpanded}
            isMobileEnabled={!!this.props.appConfig.isShowingMobileUserMenu}
            toggleMenu={this.toggleUserMenu}
            isMenuOpen={
              this.state.isUserMenuOpen || this.state.isHeaderExpanded
            }
            pathname={this.props.history.location.pathname}
            dashboardConfig={this.props.dashboardConfig}
          />
        </RightAlignedContainer>
      </SiteHeaderWrapper>
    );
  }
}

SiteHeader.propTypes = {
  appConfig: appConfigPropType.isRequired,
  currentLanguageCode: PropTypes.string.isRequired,
  currentTemplate: PropTypes.string.isRequired,
  isLeftSidebarExpanded: PropTypes.bool.isRequired,
  mapConfig: mapConfigPropType,
  navBarConfig: navBarConfigPropType,
  onChangeLanguage: PropTypes.func.isRequired,
  dashboardConfig: dashboardConfigPropType,
  setLeftSidebarComponent: PropTypes.func.isRequired,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
  resetUi: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  currentTemplate: currentTemplateSelector(state),
  isLeftSidebarExpanded: isLeftSidebarExpandedSelector(state),
  mapConfig: mapConfigSelector(state),
  navBarConfig: navBarConfigSelector(state),
  dashboardConfig: dashboardConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setLeftSidebarComponent: componentName =>
    dispatch(setLeftSidebarComponent(componentName)),
  setLeftSidebarExpanded: isExpanded =>
    dispatch(setLeftSidebarExpanded(isExpanded)),
  resetUi: () => dispatch(resetUi()),
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(translate("SiteHeader")(SiteHeader)),
);
