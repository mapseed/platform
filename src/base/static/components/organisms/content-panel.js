import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import CustomPage from "./custom-page";
import InputForm from "../input-form";
import FormCategoryMenuWrapper from "../input-form/form-category-menu-wrapper";
import PlaceDetail from "../place-detail";

const Util = require("../../js/utils.js");

import {
  contentPanelComponentSelector,
  pageSlugSelector,
  uiVisibilitySelector,
} from "../../state/ducks/ui";
import { pageSelector } from "../../state/ducks/pages-config";

const ContentPanelOuterContainer = styled("section")(props => ({
  position: "absolute",
  top: 0,
  left: props.isRightSidebarVisible ? "45%" : "60%",
  width: "40%",
  height: "100%",
  backgroundColor: "#fff",
  boxSizing: "border-box",
  boxShadow: "-4px 0 3px rgba(0,0,0,0.1)",
  zIndex: 9,
}));

const ContentPanelInnerContainer = styled("div")({
  width: "100%",
  height: "100%",
  overflow: "auto",
  padding: "15px 15px 15px 15px",
  boxSizing: "border-box",
});

const CloseButton = styled("button")({
  position: "absolute",
  top: "10px",
  left: "-35px",
  borderTopLeftRadius: "8px",
  borderBottomLeftRadius: "8px",
  backgroundColor: "#fff",
  outline: "none",
  border: "none",
  fontSize: "24px",
  color: "#ff5e99",
  boxShadow: "-4px 4px 3px rgba(0,0,0,0.1)",
  padding: "12px 10px 8px 10px",

  "&:hover": {
    color: "#cd2c67",
    cursor: "pointer",
  },
});

// TODO: scrollToResponseId
const ContentPanel = props => {
  return (
    <ContentPanelOuterContainer
      isRightSidebarVisible={props.isRightSidebarVisible}
    >
      <CloseButton
        onClick={evt => {
          evt.preventDefault();
          props.router.navigate("/", { trigger: true });
        }}
      >
        &#10005;
      </CloseButton>
      <ContentPanelInnerContainer>
        {props.contentPanelComponent === "CustomPage" && (
          <CustomPage
            pageContent={
              props.pageSelector(props.pageSlug, props.languageCode).content
            }
          />
        )}
        {props.contentPanelComponent === "PlaceDetail" && (
          <PlaceDetail
            mapContainerRef={props.mapContainerRef}
            scrollToResponseId={null}
            router={props.router}
          />
        )}
        {props.contentPanelComponent === "InputForm" && (
          <FormCategoryMenuWrapper
            router={props.router}
            // // TODO scroll to top
            // '#content article' and 'body' represent the two containers into
            // which panel content is rendered (one at desktop size and one at
            // mobile size).
            // TODO: Improve this when we move overall app layout management to
            // Redux.
            container={document.querySelector(
              Util.getPageLayout() === "desktop" ? "#content article" : "body",
            )}
            render={(state, props, onCategoryChange) => {
              return (
                <InputForm
                  {...props}
                  selectedCategory={state.selectedCategory}
                  datasetUrl={state.datasetUrl}
                  datasetSlug={state.datasetSlug}
                  isSingleCategory={state.isSingleCategory}
                  onCategoryChange={onCategoryChange}
                />
              );
            }}
            customComponents={props.customComponents}
          />
        )}
      </ContentPanelInnerContainer>
    </ContentPanelOuterContainer>
  );
};

ContentPanel.propTypes = {
  contentPanelComponent: PropTypes.string,
  isRightSidebarVisible: PropTypes.bool.isRequired,
  languageCode: PropTypes.string.isRequired,
  mapContainerRef: PropTypes.object.isRequired,
  pageSelector: PropTypes.func.isRequired,
  pageSlug: PropTypes.string,
  router: PropTypes.instanceOf(Backbone.Router).isRequired,
};

const mapStateToProps = state => ({
  contentPanelComponent: contentPanelComponentSelector(state),
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  pageSelector: (slug, lang) => pageSelector({ state, slug, lang }),
  pageSlug: pageSlugSelector(state),
});

export default connect(mapStateToProps)(ContentPanel);
