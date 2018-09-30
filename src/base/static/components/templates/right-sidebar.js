import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { Button } from "../atoms/buttons";
import StoryNavigator from "../organisms/story-navigator";
import MapLegendPanel from "../organisms/map-legend-panel";
import ActivityStream from "../organisms/activity-stream";

import { rightSidebarConfigSelector } from "../../state/ducks/right-sidebar-config";

import "./right-sidebar.scss";

const RightSidebar = props => {
  // TODO: Support multiple simultaneous right sidebar components.
  return (
    <div className="right-sidebar">
      <Button className="right-sidebar__collapse-btn" />
      {props.rightSidebarConfig.component === "StoryNavigator" && (
        <StoryNavigator {...props} />
      )}
      {props.rightSidebarConfig.component === "MapLegendPanel" && (
        <MapLegendPanel config={props.rightSidebarConfig} />
      )}
      {props.rightSidebarConfig.component === "ActivityStream" && (
        <ActivityStream config={props.rightSidebarConfig} />
      )}
    </div>
  );
};

RightSidebar.propTypes = {
  rightSidebarConfig: PropTypes.shape({
    is_enabled: PropTypes.bool.isRequired,
    is_visible_default: PropTypes.bool,
    component: PropTypes.string.isRequired,
    content: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  }),
};

const mapStateToProps = state => ({
  rightSidebarConfig: rightSidebarConfigSelector(state),
});

export default connect(mapStateToProps)(RightSidebar);
