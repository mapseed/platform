import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "react-emotion";

import StoryNavigator from "../organisms/story-navigator";
import MapLegendPanel from "../organisms/map-legend-panel";
import ActivityStream from "../organisms/activity-stream";
import { FontAwesomeIcon } from "../atoms/imagery";

import {
  rightSidebarConfigPropType,
  rightSidebarConfigSelector,
} from "../../state/ducks/right-sidebar-config";
import { placesSelector, placesPropType } from "../../state/ducks/places";
import { updateUIVisibility, uiVisibilitySelector } from "../../state/ducks/ui";
import { updateMapViewport } from "../../state/ducks/map";

const ToggleSidebarButton = styled("button")({
  position: "absolute",
  top: "50%",
  left: "-30px",
  borderTopLeftRadius: "8px",
  borderBottomLeftRadius: "8px",
  backgroundColor: "#fff",
  outline: "none",
  border: "none",
  fontSize: "24px",
  boxShadow: "-4px 4px 3px rgba(0,0,0,0.1)",
  padding: "10px 10px 10px 10px",

  "&:hover": {
    cursor: "pointer",
  },

  "&:before": {},
});

const RightSidebarOuterContainer = styled("aside")(props => ({
  zIndex: 10,
  position: "absolute",
  top: 0,
  right: 0,
  height: "100%",
  backgroundColor: "#fff",
  width: props.isRightSidebarVisible ? "15%" : 0,
  boxShadow: "-4px 0 3px rgba(0,0,0,0.1)",
  boxSizing: "border-box",
}));

const RightSidebarInnerContainer = styled("div")({
  width: "100%",
  height: "100%",
  overflow: "auto",
  boxSizing: "border-box",
});

const RightSidebar = props => {
  // TODO: Support multiple simultaneous right sidebar components.
  return (
    <RightSidebarOuterContainer isRightSidebarVisible={props.isRightSidebarVisible}>
      <RightSidebarInnerContainer>
        <ToggleSidebarButton
          onClick={() => {
            props.updateRightSidebarVisibility(!props.isRightSidebarVisible);
          }}
        >
          <FontAwesomeIcon
            color="#ff5e99"
            hoverColor="#cd2c67"
            faClassname={
              props.isRightSidebarVisible
                ? "fa fa-chevron-right"
                : "fa fa-chevron-left"
            }
          />
        </ToggleSidebarButton>
        {props.rightSidebarConfig.component === "StoryNavigator" && (
          <StoryNavigator
            storyConfig={props.storyConfig}
            placeConfig={props.placeConfig}
            places={props.places}
            router={props.router}
          />
        )}
        {props.rightSidebarConfig.component === "MapLegendPanel" && (
          <MapLegendPanel config={props.rightSidebarConfig} />
        )}
        {props.rightSidebarConfig.component === "ActivityStream" && (
          <ActivityStream config={props.rightSidebarConfig} />
        )}
        {props.rightSidebarConfig.component === "ActivityStreamWithLegend" && (
          <Fragment>
            <MapLegendPanel isThemed={true} />
            <ActivityStream config={props.rightSidebarConfig} />
          </Fragment>
        )}
      </RightSidebarInnerContainer>
    </RightSidebarOuterContainer>
  );
};

RightSidebar.propTypes = {
  isRightSidebarVisible: PropTypes.bool.isRequired,
  setMapDimensions: PropTypes.func.isRequired,
  places: placesPropType,
  rightSidebarConfig: rightSidebarConfigPropType.isRequired,
  storyConfig: PropTypes.object,
  placeConfig: PropTypes.shape({
    place_detail: PropTypes.array.isRequired,
  }),
  router: PropTypes.instanceOf(Backbone.Router).isRequired,
  updateMapViewport: PropTypes.func.isRequired,
  updateRightSidebarVisibility: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  rightSidebarConfig: rightSidebarConfigSelector(state),
  places: placesSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updateRightSidebarVisibility: isVisible =>
    dispatch(updateUIVisibility("rightSidebar", isVisible)),
  updateMapViewport: viewport => dispatch(updateMapViewport(viewport)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RightSidebar);
