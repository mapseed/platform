/** @jsx jsx */
import { Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import { jsx } from "@emotion/core";
import { ChevronRight, ChevronLeft } from "@material-ui/icons";

import StoryNavigator from "../organisms/story-navigator";
import MapLegendPanel from "../organisms/map-legend-panel";
import ActivityStream from "../organisms/activity-stream";
import Button from "@material-ui/core/Button";

import {
  rightSidebarConfigPropType,
  rightSidebarConfigSelector,
} from "../../state/ducks/right-sidebar-config";
import { placesSelector, placesPropType } from "../../state/ducks/places";
import { updateUIVisibility, uiVisibilitySelector } from "../../state/ducks/ui";

const toggleSidebarStyles = {
  position: "absolute",
  top: "50%",
  left: "-32px",
  width: "32px",
  borderTopLeftRadius: "8px",
  borderBottomLeftRadius: "8px",
  backgroundColor: "#fff",
  outline: "none",
  border: "none",
  boxShadow: "-4px 4px 3px rgba(0,0,0,0.1)",
  color: "#ff5e99",

  // MUI overrides
  minWidth: "unset",
  borderTopRightRadius: "0",
  borderBottomRightRadius: "0",

  "&:hover": {
    color: "#cd2c67",
    backgroundColor: "#fff",
  },

  "&:before": {},
};

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
    <RightSidebarOuterContainer
      isRightSidebarVisible={props.isRightSidebarVisible}
    >
      <RightSidebarInnerContainer>
        <Button
          aria-label="toggle sidebar open"
          css={toggleSidebarStyles}
          onClick={() => {
            props.updateRightSidebarVisibility(!props.isRightSidebarVisible);
          }}
        >
          {props.isRightSidebarVisible ? (
            <ChevronRight css={{ fontSize: "32px" }} />
          ) : (
            <ChevronLeft css={{ fontSize: "32px" }} />
          )}
        </Button>
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
          <ActivityStream
            config={props.rightSidebarConfig}
            router={props.router}
          />
        )}
        {props.rightSidebarConfig.component === "ActivityStreamWithLegend" && (
          <Fragment>
            <MapLegendPanel isThemed={true} />
            <ActivityStream
              config={props.rightSidebarConfig}
              router={props.router}
            />
          </Fragment>
        )}
      </RightSidebarInnerContainer>
    </RightSidebarOuterContainer>
  );
};

RightSidebar.propTypes = {
  isRightSidebarVisible: PropTypes.bool.isRequired,
  places: placesPropType,
  rightSidebarConfig: rightSidebarConfigPropType.isRequired,
  storyConfig: PropTypes.object,
  placeConfig: PropTypes.shape({
    place_detail: PropTypes.array.isRequired,
  }),
  router: PropTypes.instanceOf(Backbone.Router).isRequired,
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RightSidebar);
