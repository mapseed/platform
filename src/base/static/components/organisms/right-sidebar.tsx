/** @jsx jsx */
import * as React from "react";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import { jsx } from "@emotion/core";
import { ChevronRight, ChevronLeft } from "@material-ui/icons";

import FeaturedPlacesNavigator from "../organisms/featured-places-navigator";
import MapLegendPanel from "../organisms/map-legend-panel";
import ActivityStream from "../organisms/activity-stream";
import Button from "@material-ui/core/Button";

import {
  rightSidebarConfigPropType,
  rightSidebarConfigSelector,
} from "../../state/ducks/right-sidebar-config";
import { placesSelector, Place } from "../../state/ducks/places";
import { updateUIVisibility, uiVisibilitySelector } from "../../state/ducks/ui";
import constants from "../../constants";

const RightSidebarInnerContainer = styled("div")({
  width: "100%",
  height: "100%",
  overflow: "auto",
  boxSizing: "border-box",
});

type Props = {
  isRightSidebarVisible: boolean;
  places: Place[];
  rightSidebarConfig: rightSidebarConfigPropType.isRequired;
  updateUIVisibility: Function;
};

const RightSidebar: React.FunctionComponent<Props> = props => {
  // TODO: Support multiple simultaneous right sidebar components.
  return (
    <aside
      css={{
        zIndex: 16,
        position: "absolute",
        top: constants.HEADER_HEIGHT,
        right: 0,
        height: `calc(100% - ${constants.HEADER_HEIGHT}px)`,
        backgroundColor: "#fff",
        width: props.isRightSidebarVisible ? "15%" : 0,
        boxShadow: "-4px 0 3px rgba(0,0,0,0.1)",
        boxSizing: "border-box",
      }}
    >
      <RightSidebarInnerContainer>
        <Button
          aria-label="toggle sidebar open"
          css={{
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
          }}
          onClick={() => {
            props.updateUIVisibility(
              "rightSidebar",
              !props.isRightSidebarVisible,
            );
          }}
        >
          {props.isRightSidebarVisible ? (
            <ChevronRight css={{ fontSize: "32px" }} />
          ) : (
            <ChevronLeft css={{ fontSize: "32px" }} />
          )}
        </Button>
        {props.rightSidebarConfig.component === "FeaturedPlacesNavigator" && (
          <FeaturedPlacesNavigator places={props.places} />
        )}
        {props.rightSidebarConfig.component === "MapLegendPanel" && (
          <MapLegendPanel config={props.rightSidebarConfig} />
        )}
        {props.rightSidebarConfig.component === "ActivityStream" && (
          <ActivityStream config={props.rightSidebarConfig} />
        )}
        {props.rightSidebarConfig.component === "ActivityStreamWithLegend" && (
          <React.Fragment>
            <MapLegendPanel isThemed={true} />
            <ActivityStream config={props.rightSidebarConfig} />
          </React.Fragment>
        )}
        {props.rightSidebarConfig.component === "FeaturedPlacesWithLegend" && (
          <React.Fragment>
            <MapLegendPanel isThemed={true} />
            <FeaturedPlacesNavigator places={props.places} />
          </React.Fragment>
        )}
      </RightSidebarInnerContainer>
    </aside>
  );
};

const mapStateToProps = state => ({
  isRightSidebarVisible: uiVisibilitySelector("rightSidebar", state),
  rightSidebarConfig: rightSidebarConfigSelector(state),
  places: placesSelector(state),
});

const mapDispatchToProps = {
  updateUIVisibility,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RightSidebar);
