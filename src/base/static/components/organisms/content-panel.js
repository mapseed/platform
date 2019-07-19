import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { CloseButton as InnerCloseButton } from "../atoms/buttons";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import CustomPage from "./custom-page";
import FormCategoryMenuWrapper from "../input-form/form-category-menu-wrapper";
import PlaceDetail from "../place-detail";
import constants from "../../constants";

import {
  contentPanelComponentSelector,
  layoutSelector,
  pageSlugSelector,
  uiVisibilitySelector,
} from "../../state/ducks/ui";
import { mapViewportPropType } from "../../state/ducks/map-style";
import { focusedPlaceSelector, placePropType } from "../../state/ducks/places";
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
  top: props.layout === "desktop" ? `${constants.HEADER_HEIGHT}px` : "60%",
  width: props.layout === "desktop" ? "40%" : "100%",
  left: getLeftOffset(props.isRightSidebarVisible, props.layout),
  height:
    props.layout === "desktop"
      ? `calc(100% - ${constants.HEADER_HEIGHT}px)`
      : "unset",
  backgroundColor: "#fff",
  boxSizing: "border-box",
  boxShadow:
    props.layout === "desktop"
      ? "-4px 0 3px rgba(0,0,0,0.1)"
      : "0 -4px 3px rgba(0,0,0,0.1)",
  zIndex: 15,
}));

const ContentPanelInnerContainer = styled("div")(props => ({
  width: "100%",
  height: "100%",
  overflow: props.layout === "desktop" ? "auto" : "visible",
  padding: `15px 15px ${
    props.layout === "desktop" ? 15 : 15 + props.addPlaceButtonHeight
  }px 15px`,
  boxSizing: "border-box",
  scrollbarWidth: "none",

  "::-webkit-scrollbar": {
    width: 0,
    height: 0,
  },
}));

const CloseButton = styled(InnerCloseButton)(props => ({
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
    props.layout === "desktop" ? "9px 10px 8px 10px" : "10px 16px 10px 16px",

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
            this.props.history.push("/");
          }}
        />
        <ContentPanelInnerContainer
          ref={this.contentPanelInnerContainerRef}
          layout={this.props.layout}
          addPlaceButtonHeight={this.props.addPlaceButtonHeight}
        >
          {this.props.contentPanelComponent === "CustomPage" && (
            <CustomPage
              currentLanguageCode={this.props.currentLanguageCode}
              defaultLanguageCode={this.props.defaultLanguageCode}
              layout={this.props.layout}
              pageSlug={this.props.pageSlug}
            />
          )}
          {this.props.contentPanelComponent === "PlaceDetail" &&
            this.props.focusedPlace && (
              <PlaceDetail
                contentPanelInnerContainerRef={
                  this.contentPanelInnerContainerRef
                }
                mapContainerRef={this.props.mapContainerRef}
                scrollToResponseId={null}
              />
            )}
          {this.props.contentPanelComponent === "InputForm" && (
            <FormCategoryMenuWrapper
              contentPanelInnerContainerRef={this.contentPanelInnerContainerRef}
              isMapTransitioning={this.props.isMapTransitioning}
              layout={this.props.layout}
              mapViewport={this.props.mapViewport}
              onUpdateMapViewport={this.props.onUpdateMapViewport}
              onUpdateMapDraggedOrZoomedByUser={this.props.onUpdateMapDraggedOrZoomedByUser}
            />
          )}
        </ContentPanelInnerContainer>
      </ContentPanelOuterContainer>
    );
  }
}

ContentPanel.propTypes = {
  addPlaceButtonHeight: PropTypes.number.isRequired,
  contentPanelComponent: PropTypes.string,
  focusedPlace: placePropType,
  history: PropTypes.object.isRequired,
  isMapTransitioning: PropTypes.bool.isRequired,
  isRightSidebarVisible: PropTypes.bool.isRequired,
  currentLanguageCode: PropTypes.string.isRequired,
  defaultLanguageCode: PropTypes.string.isRequired,
  layout: PropTypes.string.isRequired,
  mapContainerRef: PropTypes.object.isRequired,
  pageSelector: PropTypes.func.isRequired,
  pageSlug: PropTypes.string,
  onUpdateMapDraggedOrZoomedByUser: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  contentPanelComponent: contentPanelComponentSelector(state),
  focusedPlace: focusedPlaceSelector(state),
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  layout: layoutSelector(state),
  pageSelector: (slug, lang) => pageSelector({ state, slug, lang }),
  pageSlug: pageSlugSelector(state),
});

export default withRouter(connect(mapStateToProps)(ContentPanel));
