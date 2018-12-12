/* eslint react/display-name: 0 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import { SiteLogo } from "../atoms/imagery";
import { Link } from "../atoms/navigation";
import { NavButton } from "../molecules/buttons";
import { NavLink } from "../molecules/typography";
import UserMenu from "../molecules/user-menu";
import { RegularTitle, RegularLabel } from "../atoms/typography";

import {
  navBarConfigPropType,
  navBarConfigSelector,
} from "../../state/ducks/nav-bar-config";
import FilterMenu from "./filter-menu";
import { appConfigSelector } from "../../state/ducks/app-config";
import { mapConfigSelector } from "../../state/ducks/map-config";
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
    alignItems: "center",
    marginLeft: "50px",
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

const LanguagePickerMenuItem = styled("li")(props => ({
  fontFamily: props.theme.text.navBarFontFamily,
  textTransform: "uppercase",
  fontSize: "0.75rem",
  padding: "8px",
  "&:hover": {
    color: props.theme.text.highlighted,
    backgroundColor: props.theme.bg.highlighted,
    cursor: "pointer",
  },

  [mq[0]]: {
    width: "100%",
  },
}));

const LanguagePicker = styled("nav")(props => ({
  textTransform: "uppercase",
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

  [mq[1]]: {
    display: "none",
  },
});

const LogoTitleWrapper = styled(props => (
  <Link
    className={props.className}
    variant="unstyled"
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
      <NavButton color={"tertiary"} onClick={linkProps.onClick}>
        {linkProps.children}
      </NavButton>
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
    <NavLink
      className={linkProps.className}
      height="42px"
      href={linkProps.currentTemplate === "map" ? "/list" : "/"}
    >
      <NavButton variant="raised" color="primary">
        {linkProps.currentTemplate === "map"
          ? linkProps.navBarItem.show_list_button_label
          : linkProps.navBarItem.show_map_button_label}
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
  filter: FilterMenu,
};

class SiteHeader extends Component {
  state = {
    isLanguageMenuVisible: false, // relevant on desktop layouts
    isHeaderExpanded: false, // relevant on mobile layouts
  };

  render() {
    return (
      <SiteHeaderWrapper>
        <LogoTitleWrapper
          zoom={this.props.mapConfig.options.map.zoom.toFixed(2)}
          lat={this.props.mapConfig.options.map.center.lat.toFixed(5)}
          lng={this.props.mapConfig.options.map.center.lng.toFixed(5)}
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
                  <LanguageLink
                    key={language.code}
                    href={`/${language.code}.html`}
                  >
                    <LanguagePickerMenuItem>
                      <RegularLabel>{language.label}</RegularLabel>
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
    logo: PropTypes.string,
    show_name_in_header: PropTypes.bool,
  }).isRequired,
  currentTemplate: PropTypes.string.isRequired,
  currentUser: PropTypes.object,
  isLeftSidebarExpanded: PropTypes.bool.isRequired,
  languageCode: PropTypes.string.isRequired,
  mapConfig: PropTypes.shape({
    options: PropTypes.shape({
      map: PropTypes.shape({
        center: PropTypes.shape({
          lat: PropTypes.number.isRequired,
          lng: PropTypes.number.isRequired,
        }).isRequired,
        zoom: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  navBarConfig: navBarConfigPropType,
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
