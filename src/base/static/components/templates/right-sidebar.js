import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import styled from "react-emotion";
import StoryNavigator from "../organisms/story-navigator";
import MapLegendPanel from "../organisms/map-legend-panel";
import ActivityStream from "../organisms/activity-stream";

import { rightSidebarConfigSelector } from "../../state/ducks/right-sidebar-config";
import { setMapSizeValidity } from "../../state/ducks/map";

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
          props.setMapSizeValidity(false);
        }}
        className="right-sidebar__collapse-btn"
      />
      {props.rightSidebarConfig.component === "StoryNavigator" && (
        <StoryNavigator
          storyConfig={props.storyConfig}
          placeConfig={props.placeConfig}
          mapConfig={props.mapConfig}
          places={props.places}
          routes={props.router}
        />
      )}
      {props.rightSidebarConfig.component === "MapLegendPanel" && (
        <MapLegendPanel config={props.rightSidebarConfig} />
      )}
      {props.rightSidebarConfig.component === "ActivityStream" && (
        <ActivityStream
          config={props.rightSidebarConfig}
          places={props.places}
        />
      )}
      {props.rightSidebarConfig.component === "ActivityStreamWithLegend" && (
        <Fragment>
          <MapLegendPanel config={props.rightSidebarConfig} isThemed={true} />
          <ActivityStream
            config={props.rightSidebarConfig}
            places={props.places}
          />
        </Fragment>
      )}
    </div>
  );
};

RightSidebar.propTypes = {
  places: PropTypes.objectOf(PropTypes.instanceOf(Backbone.Collection)),
  rightSidebarConfig: PropTypes.shape({
    is_enabled: PropTypes.bool.isRequired,
    is_visible_default: PropTypes.bool,
    component: PropTypes.string.isRequired,
    content: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  }),
  setMapSizeValidity: PropTypes.func.isRequired,
  storyConfig: PropTypes.object,
  placeConfig: PropTypes.shape({
    place_detail: PropTypes.array.isRequired,
  }),
  mapConfig: PropTypes.object,

  router: PropTypes.instanceOf(Backbone.Router),
};

const mapStateToProps = state => ({
  rightSidebarConfig: rightSidebarConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setMapSizeValidity: isValid => dispatch(setMapSizeValidity(isValid)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RightSidebar);
