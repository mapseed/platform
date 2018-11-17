import React from "react";
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

// TODO: Make the outermost div a header element when we dissolve base.hbs.
// Right now the header element lives in base.hbs.
const SiteHeaderWrapper = styled("div")(props => ({
  backgroundColor: props.theme.bg.default,
  display: "flex",
  alignItems: "center",
  height: "100%",
}));

const NavContainer = styled("nav")(props => ({
  marginLeft: "50px",
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
}));

const SiteTitle = styled(RegularTitle)(props => ({
  color: props.theme.text.titleColor,
  fontFamily: props.theme.text.titleFontFamily,
  marginBottom: 0,
  marginLeft: "15px",
  letterSpacing: "1px",
}));

const NavLink = styled(props => {
  return (
    <Link href={props.href} rel="internal" className={props.className}>
      {props.children}
    </Link>
  );
})(props => ({
  borderLeft:
    props.position > 0 ? `solid 1px ${props.theme.brand.primary}` : "none",
}));

const NavButtonWrapper = styled("span")(props => ({
  borderLeft:
    props.position > 0 ? `solid 1px ${props.theme.brand.primary}` : "none",
}));

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
  list_toggle: props => (
    <NavLink href={props.currentTemplate === "map" ? "/list" : "/"}>
      <NavButton variant="raised" color="secondary">
        {props.currentTemplate === "map"
          ? props.navBarItem.show_list_button_label
          : props.navBarItem.show_map_button_label}
      </NavButton>
    </NavLink>
  ),
};

const SiteHeader = props => {
  return (
    <SiteHeaderWrapper>
      {props.appConfig.logo && (
        <SiteLogo src={props.appConfig.logo} alt={props.appConfig.name} />
      )}
      {props.appConfig.show_name_in_header && (
        <SiteTitle>{props.appConfig.name}</SiteTitle>
      )}
      <NavContainer>
        {props.navBarConfig
          .filter(navBarItem => !navBarItem.hide_from_top_bar)
          .map((navBarItem, i) => {
            const NavItemComponent = navItemMappings[navBarItem.type];
            return (
              <NavItemComponent
                key={i}
                position={i}
                navBarItem={navBarItem}
                currentTemplate={props.currentTemplate}
                setLeftSidebarComponent={props.setLeftSidebarComponent}
                setLeftSidebarExpanded={props.setLeftSidebarExpanded}
                isLeftSidebarExpanded={props.isLeftSidebarExpanded}
              >
                {navBarItem.title}
              </NavItemComponent>
            );
          })}
      </NavContainer>
      <UserMenu
        router={props.router}
        apiRoot={props.appConfig.api_root}
        currentUser={props.currentUser}
        datasetDownloadConfig={props.appConfig.dataset_download}
      />
    </SiteHeaderWrapper>
  );
};

SiteHeader.propTypes = {
  appConfig: PropTypes.shape({
    api_root: PropTypes.string.isRequired,
    dataset_download: PropTypes.object,
    name: PropTypes.string,
  }).isRequired,
  currentTemplate: PropTypes.string.isRequired,
  isLeftSidebarExpanded: PropTypes.bool.isRequired,
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
