import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import { SiteLogo } from "../atoms/imagery";
import { Button } from "../atoms/buttons";
import { Link } from "../atoms/navigation";
import UserMenu from "../molecules/user-menu";
import { RegularTitle } from "../atoms/typography";

import { navBarConfigSelector } from "../../state/ducks/nav-bar-config";
import { appConfigSelector } from "../../state/ducks/app-config";
import { currentTemplateSelector } from "../../state/ducks/ui";
import {
  isLeftSidebarExpandedSelector,
  setLeftSidebarComponent,
  setLeftSidebarExpanded,
} from "../../state/ducks/left-sidebar";
import mq from "../../../../media-queries";

// TODO: Make the outermost div a header element when we dissolve base.hbs.
// Right now the header element lives in base.hbs.
const SiteHeaderWrapper = styled("div")(props => ({
  backgroundColor: props.theme.bg.default,
  display: "flex",
  height: "100%",
  alignItems: "center",

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
    marginLeft: "50px",
  },
}));

const NavButton = styled(props => {
  return (
    <Button
      className={props.className}
      color={props.color}
      variant={props.variant}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
})(props => ({
  fontFamily: props.theme.text.navBarFontFamily,
  fontWeight: 600,
  marginLeft: "4px",
  marginRight: "4px",

  [mq[0]]: {
    width: "100%",
  },
}));

const SiteTitle = styled(RegularTitle)(props => ({
  color: props.theme.text.titleColor,
  fontFamily: props.theme.text.titleFontFamily,
  marginBottom: 0,
  marginLeft: "15px",
  letterSpacing: "1px",
}));

const NavLink = styled(props => (
  <Link href={props.href} rel="internal" className={props.className}>
    {props.children}
  </Link>
))(props => ({
  display: "flex",
  textDecoration: "none",

  [mq[1]]: {
    borderLeft:
      props.position > 0 ? `solid 1px ${props.theme.brand.primary}` : "none",
  },
}));

const NavButtonWrapper = styled("span")(props => ({
  [mq[1]]: {
    borderLeft:
      props.position > 0 ? `solid 1px ${props.theme.brand.primary}` : "none",
  },
}));

const LanguagePickerMenu = styled("ul")(props => ({
  backgroundColor: props.theme.bg.default,

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
    border: "3px solid rgba(0, 0, 0, 0.05)",
  },
}));

const LanguagePickerMenuItem = styled("li")(props => ({
  textTransform: "uppercase",
  fontSize: "0.75rem",
  padding: "8px",
  "&:hover": {
    color: props.theme.text.secondary,
    backgroundColor: props.theme.brand.accent,
    cursor: "pointer",
  },

  [mq[0]]: {
    width: "100%",
  },
}));

const LanguagePicker = styled("nav")(props => ({
  textTransform: "uppercase",
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

const LanguageLink = styled(Link)({
  textDecoration: "none",

  [mq[0]]: {
    display: "flex",
    width: "100%",
    textAlign: "center",
  },
});

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
});

const LogoTitleWrapper = styled("div")({
  [mq[0]]: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
});

const navItemMappings = {
  internal_link: props => (
    <NavLink position={props.position} href={props.navBarItem.url}>
      <NavButton
        variant={props.navBarItem.variant}
        color={props.navBarItem.color || "tertiary"}
      >
        {props.children}
      </NavButton>
    </NavLink>
  ),
  left_sidebar_toggle: props => (
    <NavButtonWrapper position={props.position}>
      <NavButton
        variant={props.navBarItem.variant}
        color={props.navBarItem.color || "tertiary"}
        onClick={() => {
          props.setLeftSidebarComponent(props.navBarItem.component);
          props.setLeftSidebarExpanded(!props.isLeftSidebarExpanded);
        }}
      >
        {props.children}
      </NavButton>
    </NavButtonWrapper>
  ),
  list_toggle: styled(props => (
    <NavLink
      className={props.className}
      href={props.currentTemplate === "map" ? "/list" : "/"}
    >
      <NavButton variant="raised" color="secondary">
        {props.currentTemplate === "map"
          ? props.navBarItem.show_list_button_label
          : props.navBarItem.show_map_button_label}
      </NavButton>
    </NavLink>
  ))(() => ({
    [mq[0]]: {
      display: "none",
    },
    [mq[1]]: {
      display: "block",
    },
  })),
};

class SiteHeader extends Component {
  state = {
    isLanguageMenuVisible: false, // relevant on desktop layouts
    isHeaderExpanded: false, // relevant on mobile layouts
  };

  render() {
    return (
      <SiteHeaderWrapper>
        <LogoTitleWrapper>
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
          {this.props.navBarConfig
            .filter(navBarItem => !navBarItem.hide_from_top_bar)
            .map((navBarItem, i) => {
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
                >
                  {navBarItem.title}
                </NavItemComponent>
              );
            })}
        </NavContainer>
        <RightAlignedContainer isHeaderExpanded={this.state.isHeaderExpanded}>
          {this.props.appConfig.languages && (
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
                  <LanguageLink href={`/${language.code}.html`}>
                    <LanguagePickerMenuItem>
                      {language.label}
                    </LanguagePickerMenuItem>
                  </LanguageLink>
                ))}
              </LanguagePickerMenu>
            </LanguagePicker>
          )}
          <UserMenu
            router={this.props.router}
            apiRoot={this.props.appConfig.api_root}
            currentUser={this.props.currentUser}
            datasetDownloadConfig={this.props.appConfig.dataset_download}
          />
        </RightAlignedContainer>
      </SiteHeaderWrapper>
    );
  }
}

SiteHeader.propTypes = {
  appConfig: PropTypes.shape({
    api_root: PropTypes.string.isRequired,
    dataset_download: PropTypes.object,
    name: PropTypes.string,
    languages: PropTypes.arrayOf(
      PropTypes.shape({
        code: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }),
    ),
  }).isRequired,
  currentTemplate: PropTypes.string.isRequired,
  currentUser: PropTypes.object,
  isLeftSidebarExpanded: PropTypes.bool.isRequired,
  languageCode: PropTypes.string.isRequired,
  navBarConfig: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      type: PropTypes.string.isRequired,
      url: PropTypes.string,
      start_page: PropTypes.bool,
      name: PropTypes.string,
      component: PropTypes.string,
    }),
  ),
  router: PropTypes.instanceOf(Backbone.Router),
  setLeftSidebarComponent: PropTypes.func.isRequired,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  currentTemplate: currentTemplateSelector(state),
  isLeftSidebarExpanded: isLeftSidebarExpandedSelector(state),
  navBarConfig: navBarConfigSelector(state),
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
