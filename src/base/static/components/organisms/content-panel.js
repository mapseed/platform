import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import CustomPage from "./custom-page";
import InputForm from "../input-form";
import FormCategoryMenuWrapper from "../input-form/form-category-menu-wrapper";
import PlaceDetail from "../place-detail";

import {
  contentPanelComponentSelector,
  layoutSelector,
  pageSlugSelector,
  uiVisibilitySelector,
} from "../../state/ducks/ui";
import { pageSelector } from "../../state/ducks/pages-config";

const getLeftOffset = (isRightSidebarVisible, layout) => {
  switch (layout) {
    case "desktop":
      return isRightSidebarVisible ? "45%" : "60%";
    case "mobile":
      return 0;
  }
};

const ContentPanelOuterContainer = styled("section")(props => ({
  position: "absolute",
  top: props.layout === "desktop" ? 0 : "60%",
  width: props.layout === "desktop" ? "40%" : "100%",
  left: getLeftOffset(props.isRightSidebarVisible, props.layout),
  height: props.layout === "desktop" ? "100%" : "unset",
  backgroundColor: "#fff",
  boxSizing: "border-box",
  boxShadow:
    props.layout === "desktop"
      ? "-4px 0 3px rgba(0,0,0,0.1)"
      : "0 -4px 3px rgba(0,0,0,0.1)",
  zIndex: 9,
}));

const ContentPanelInnerContainer = styled("div")(props => ({
  width: "100%",
  height: "100%",
  overflow: props.layout === "desktop" ? "auto" : "visible",
  padding: "15px 15px 15px 15px",
  boxSizing: "border-box",
}));

// TODO: Abstract this out into a molecule.
const CloseButton = styled("button")(props => ({
  position: "absolute",
  top: props.layout === "desktop" ? "10px" : "-33px",
  left: props.layout === "desktop" ? "-33px" : "10px",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: props.layout === "desktop" ? 0 : "8px",
  borderBottomLeftRadius: props.layout === "desktop" ? "8px" : 0,
  backgroundColor: "#fff",
  outline: "none",
  border: "none",
  fontSize: props.layout === "desktop" ? "24px" : "16px",
  color: "#ff5e99",
  boxShadow:
    props.layout === "desktop"
      ? "-4px 4px 3px rgba(0,0,0,0.1)"
      : "4px -4px 3px rgba(0,0,0,0.1)",
  padding:
    props.layout === "desktop" ? "12px 10px 8px 10px" : "10px 16px 10px 16px",

  "&:hover": {
    color: "#cd2c67",
    cursor: "pointer",
  },
}));

class ContentPanel extends Component {
  contentPanelOuterContainerRef = createRef();
  contentPanelInnerContainerRef = createRef();

  render() {
    return (
      <ContentPanelOuterContainer
        layout={this.props.layout}
        ref={this.contentPanelOuterContainerRef}
        isRightSidebarVisible={this.props.isRightSidebarVisible}
      >
        <CloseButton
          layout={this.props.layout}
          onClick={evt => {
            evt.preventDefault();
            this.props.router.navigate("/", { trigger: true });
          }}
        >
          &#10005;
        </CloseButton>
        <ContentPanelInnerContainer
          ref={this.contentPanelInnerContainerRef}
          layout={this.props.layout}
        >
          {this.props.contentPanelComponent === "CustomPage" && (
            <CustomPage
              pageContent={
                this.props.pageSelector(
                  this.props.pageSlug,
                  this.props.languageCode,
                ).content
              }
            />
          )}
          {this.props.contentPanelComponent === "PlaceDetail" && (
            <PlaceDetail
              contentPanelInnerContainerRef={this.contentPanelInnerContainerRef}
              mapContainerRef={this.props.mapContainerRef}
              scrollToResponseId={null}
              router={this.props.router}
            />
          )}
          {this.props.contentPanelComponent === "InputForm" && (
            <FormCategoryMenuWrapper
              router={this.props.router}
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
            />
          )}
        </ContentPanelInnerContainer>
      </ContentPanelOuterContainer>
    );
  }
}

ContentPanel.propTypes = {
  contentPanelComponent: PropTypes.string,
  isRightSidebarVisible: PropTypes.bool.isRequired,
  languageCode: PropTypes.string.isRequired,
  layout: PropTypes.string.isRequired,
  mapContainerRef: PropTypes.object.isRequired,
  pageSelector: PropTypes.func.isRequired,
  pageSlug: PropTypes.string,
  router: PropTypes.instanceOf(Backbone.Router).isRequired,
};

const mapStateToProps = state => ({
  contentPanelComponent: contentPanelComponentSelector(state),
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  layout: layoutSelector(state),
  pageSelector: (slug, lang) => pageSelector({ state, slug, lang }),
  pageSlug: pageSlugSelector(state),
});

export default connect(mapStateToProps)(ContentPanel);
