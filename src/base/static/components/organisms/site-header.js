/* eslint react/display-name: 0 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import { SiteLogo } from "../atoms/imagery";
import { Link } from "../atoms/navigation";
import { NavButton } from "../molecules/buttons";
import UserMenu from "../molecules/user-menu";
import { RegularTitle } from "../atoms/typography";

import {
  navBarConfigPropType,
  navBarConfigSelector,
} from "../../state/ducks/nav-bar-config";
import FilterMenu from "./filter-menu";
import {
  appConfigSelector,
  appConfigPropType,
} from "../../state/ducks/app-config";
import { mapConfigSelector } from "../../state/ducks/map-config";
import {
  dashboardConfigSelector,
  dashboardConfigPropType,
} from "../../state/ducks/dashboard-config";
import { currentTemplateSelector } from "../../state/ducks/ui";
import {
  isLeftSidebarExpandedSelector,
  setLeftSidebarComponent,
  setLeftSidebarExpanded,
} from "../../state/ducks/left-sidebar";
import mq from "../../../../media-queries";

const SiteHeaderWrapper = styled("header")(props => ({
  position: "relative",
  zIndex: 12,
  backgroundColor: props.theme.bg.default,
  display: "flex",
  height: "56px",
  alignItems: "center",
  boxShadow: "0 2px 0 rgba(0,0,0,0.2)",

  [mq[0]]: {
    flexDirection: "column",
    padding: "8px",
  },
  [mq[1]]: {
    flexDirection: "row",
  },
}));

const NavContainer = styled("nav")(props => ({
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
}));

const NavLinkWrapper = styled("div")(props => ({
  borderLeft:
    props.position > 0 ? `solid 1px ${props.theme.text.tertiary}` : "none",
}));

const ListToggleLink = styled(props => (
  <Link href={props.href} rel="internal" className={props.className}>
    {props.children}
  </Link>
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

const NavLink = styled(props => (
  <NavLinkWrapper position={props.position}>
    <Link
      href={props.href}
      rel="internal"
      className={props.className}
      style={{ padding: "4px 4px 4px 4px" }}
    >
      {props.children}
    </Link>
  </NavLinkWrapper>
))(props => ({
  // TODO: Many of these style rules should eventually be moved to the Link atom.
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  textTransform: "uppercase",
  fontSize: "0.9rem",
  fontFamily: props.theme.brand.navBarFontFamily,
  fontWeight: 600,
  color: props.theme.bg.light,
  marginRight: "4px",
  marginLeft: "4px",
  borderRadius: "3px",

  [mq[1]]: {
    height: props.height,

    "&:hover": {
      color: props.theme.text.secondary,
      backgroundColor: props.theme.brand.accent,
    },
  },
}));

const SiteTitle = styled(RegularTitle)(props => ({
  color: props.theme.text.titleColor,
  fontFamily: props.theme.text.titleFontFamily,
  marginBottom: 0,
  marginLeft: "15px",
  letterSpacing: "1px",

  [mq[0]]: {
    // NOTE: This is an override of our RegularTitle font size.
    fontSize: "1rem",
  },
}));

const NavButtonWrapper = styled("span")(props => ({
  [mq[1]]: {
    display: "flex",
    alignItems: "center",
    height: "24px",
    borderLeft:
      props.position > 0 ? `solid 1px ${props.theme.text.tertiary}` : "none",
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

const LanguageLink = styled("a")(props => ({
  fontFamily: props.theme.text.headerBarFontFamily,
  fontSize: "1rem",
  textDecoration: "none",
  padding: "8px",
  display: "block",
  textAlign: "center",

  "&:hover": {
    color: props.theme.text.secondary,
    backgroundColor: props.theme.bg.highlighted,
    cursor: "pointer",
  },

  [mq[0]]: {
    display: "flex",
    width: "100%",
    textAlign: "center",
  },
}));

const RightAlignedContainer = styled("div")(props => ({
  alignItems: "center",

  [mq[0]]: {
    display: props.isHeaderExpanded ? "flex" : "none",
    marginLeft: 0,
    width: "100%",
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

const LogoTitleWrapper = styled(props => (
  <Link
    className={props.className}
    href={`/${props.zoom}/${props.lat}/${props.lng}`}
    rel="internal"
  >
    {props.children}
  </Link>
))(() => ({
  display: "flex",
  alignItems: "center",
  textDecoration: "none",

  [mq[0]]: {
    width: "100%",
  },
}));

const navItemMappings = {
  internal_link: linkProps => (
    <NavLink
      height="24px"
      position={linkProps.position}
      href={linkProps.navBarItem.url}
    >
      {linkProps.children}
    </NavLink>
  ),
  left_sidebar_toggle: linkProps => (
    <NavButtonWrapper position={linkProps.position}>
      <NavButton
        color={"tertiary"}
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
      href={linkProps.currentTemplate === "map" ? "/list" : "/"}
    >
      {linkProps.currentTemplate === "map"
        ? linkProps.navBarItem.show_list_button_label
        : linkProps.navBarItem.show_map_button_label}
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

class SiteHeader extends Component {
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
    return (
      <SiteHeaderWrapper>
        <LogoTitleWrapper
          zoom={this.props.mapConfig.options.mapViewport.zoom.toFixed(2)}
          lat={this.props.mapConfig.options.mapViewport.latitude.toFixed(5)}
          lng={this.props.mapConfig.options.mapViewport.longitude.toFixed(5)}
        >
          <NavBarHamburger
            onClick={() => {
              this.setState({
                isHeaderExpanded: !this.state.isHeaderExpanded,
              });
            }}
          />
          {this.props.appConfig.logo && (
            <SiteLogo
              src={this.props.appConfig.logo}
              alt={this.props.appConfig.name}
            />
          )}
          {this.props.appConfig.show_name_in_header && (
            <SiteTitle>{this.props.appConfig.name}</SiteTitle>
          )}
        </LogoTitleWrapper>
        <NavContainer isHeaderExpanded={this.state.isHeaderExpanded}>
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
                onClick={() => {
                  this.setState({
                    isHeaderExpanded: false,
                  });
                }}
              >
                {navBarItem.title}
              </NavItemComponent>
            );
          })}
        </NavContainer>
        <RightAlignedContainer isHeaderExpanded={this.state.isHeaderExpanded}>
          {this.props.appConfig.languages &&
            this.props.appConfig.languages.length > 1 && (
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
                  this.props.appConfig.languages.find(
                    language => language.code === this.props.languageCode,
                  ).label
                }{" "}
                ⌄
                <LanguagePickerMenu
                  isLanguageMenuVisible={this.state.isLanguageMenuVisible}
                >
                  {this.props.appConfig.languages.map(language => (
                    <LanguagePickerMenuItem key={language.code}>
                      <LanguageLink href={`/${language.code}.html`}>
                        {language.label}
                      </LanguageLink>
                    </LanguagePickerMenuItem>
                  ))}
                </LanguagePickerMenu>
              </LanguagePicker>
            )}
          <UserMenu
            router={this.props.router}
            apiRoot={this.props.appConfig.api_root}
            isInMobileMode={this.state.isHeaderExpanded}
            isMobileEnabled={!!this.props.appConfig.isShowingMobileUserMenu}
            toggleMenu={this.toggleUserMenu}
            isMenuOpen={
              this.state.isUserMenuOpen || this.state.isHeaderExpanded
            }
            currentTemplate={this.props.currentTemplate}
            dashboardConfig={this.props.dashboardConfig}
          />
        </RightAlignedContainer>
      </SiteHeaderWrapper>
    );
  }
}

SiteHeader.propTypes = {
  appConfig: appConfigPropType.isRequired,
  currentTemplate: PropTypes.string.isRequired,
  isLeftSidebarExpanded: PropTypes.bool.isRequired,
  languageCode: PropTypes.string.isRequired,
  mapConfig: PropTypes.shape({
    options: PropTypes.shape({
      mapViewport: PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
        zoom: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  navBarConfig: navBarConfigPropType,
  dashboardConfig: dashboardConfigPropType,
  router: PropTypes.instanceOf(Backbone.Router),
  setLeftSidebarComponent: PropTypes.func.isRequired,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SiteHeader);
