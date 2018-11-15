import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import { SiteLogo } from "../atoms/imagery";
import { Button } from "../atoms/buttons";
import { Link } from "../atoms/navigation";
import UserMenu from "../molecules/user-menu";

import { pagesConfigSelector } from "../../state/ducks/pages-config";
import { appConfigSelector } from "../../state/ducks/app-config";
import { placeConfigSelector } from "../../state/ducks/place-config";
import { currentTemplateSelector } from "../../state/ducks/ui";

// TODO: Make the outermost div a header element when we dissolve base.hbs.
// Right now the header element lives in base.hbs.
const SiteHeaderWrapper = styled("div")(props => ({
  backgroundColor: props.theme.bg.default,
  display: "flex",
  alignItems: "center",
  height: "100%",
}));

const PagesNavContainer = styled("nav")(props => ({
  marginLeft: "50px",
}));

const PageNavButton = styled(props => {
  return (
    <Button className={props.className} color="tertiary">
      {props.children}
    </Button>
  );
})(() => ({
  marginLeft: "4px",
  marginRight: "4px",
}));

const ToggleListButton = styled(props => {
  return (
    <Button className={props.className} variant="raised" color="secondary">
      {props.children}
    </Button>
  );
})(() => ({
  marginLeft: "8px",
}));

const PageNavLink = styled(props => {
  return (
    <Link href={props.href} rel="internal" className={props.className}>
      {props.children}
    </Link>
  );
})(props => ({
  borderLeft:
    props.position > 0 ? `solid 1px ${props.theme.brand.primary}` : "none",
}));

const SiteHeader = props => {
  return (
    <SiteHeaderWrapper>
      <SiteLogo src={props.appConfig.logo} alt={props.appConfig.name} />
      <PagesNavContainer>
        {props.pagesConfig
          .filter(page => !page.hide_from_top_bar)
          .map((page, i) => (
            <PageNavLink
              position={i}
              key={page.slug}
              href={`/page/${page.slug}`}
            >
              <PageNavButton>{page.title}</PageNavButton>
            </PageNavLink>
          ))}
      </PagesNavContainer>
      {props.appConfig.list_enabled !== false && (
        <a
          href={props.currentTemplate === "map" ? "/list" : "/"}
          rel="internal"
        >
          <ToggleListButton>
            {props.currentTemplate === "map"
              ? props.placeConfig.show_list_button_label
              : props.placeConfig.show_map_button_label}
          </ToggleListButton>
        </a>
      )}
      <UserMenu
        router={props.router}
        apiRoot={props.appConfig.api_root}
        currentUser={props.currentUser}
        datasetDownloadConfig={props.appConfig.dataset_download}
      />
    </SiteHeaderWrapper>
  );
};

SiteHeader.propTypes = {};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  currentTemplate: currentTemplateSelector(state),
  pagesConfig: pagesConfigSelector(state),
  placeConfig: placeConfigSelector(state),
});

export default connect(mapStateToProps)(SiteHeader);
