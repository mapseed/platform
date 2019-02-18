import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import styled from "react-emotion";
import StoryNavigator from "../organisms/story-navigator";
import MapLegendPanel from "../organisms/map-legend-panel";
import ActivityStream from "../organisms/activity-stream";

import {
  rightSidebarConfigPropType,
  rightSidebarConfigSelector,
} from "../../state/ducks/right-sidebar-config";
import { placesSelector, placesPropType } from "../../state/ducks/places";
import { updateMapSizeValidity } from "../../state/ducks/map";

import "./right-sidebar.scss";

const ToggleSidebarButton = styled("div")({
  cursor: "pointer",
});

const RightSidebar = props => {
  // TODO: Support multiple simultaneous right sidebar components.
  return (
    <div className="right-sidebar">
      <ToggleSidebarButton
        onClick={() => {
          $("body").toggleClass("right-sidebar-visible");
          props.updateMapSizeValidity(false);
        }}
        className="right-sidebar__collapse-btn"
      />
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
    </div>
  );
};

RightSidebar.propTypes = {
  places: placesPropType,
  rightSidebarConfig: rightSidebarConfigPropType.isRequired,
  updateMapSizeValidity: PropTypes.func.isRequired,
  storyConfig: PropTypes.object,
  placeConfig: PropTypes.shape({
    place_detail: PropTypes.array.isRequired,
  }),
  router: PropTypes.instanceOf(Backbone.Router).isRequired,
};

const mapStateToProps = state => ({
  rightSidebarConfig: rightSidebarConfigSelector(state),
  places: placesSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updateMapSizeValidity: isValid => dispatch(updateMapSizeValidity(isValid)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RightSidebar);
