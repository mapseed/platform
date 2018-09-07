import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  isLeftSidebarExpandedSelector,
  leftSidebarComponentSelector,
  setLeftSidebar,
} from "../../state/ducks/ui";
import { CloseButton } from "../atoms/navigation";

import MapLayerPanel from "./map-layer-panel";
import MapFilterPanel from "./map-filter-panel";
import MapLegendPanel from "./map-legend-panel";

import { leftSidebarPanelConfigSelector } from "../../state/ducks/left-sidebar-config";

import "./left-sidebar.scss";

const LeftSidebar = props => {
  return props.isLeftSidebarExpanded ? (
    <div className="left-sidebar">
      <CloseButton
        classes="left-sidebar__close-button"
        onClick={() => props.setLeftSidebar({ isExpanded: false })}
      />
      {props.leftSidebarComponent === "MapLayerPanel" && <MapLayerPanel />}
      {props.leftSidebarComponent === "MapFilterPanel" && <MapFilterPanel />}
      {props.leftSidebarComponent === "MapLegendPanel" && (
        <MapLegendPanel config={props.mapLegendPanelConfig} />
      )}
    </div>
  ) : null;
};

LeftSidebar.propTypes = {
  isLeftSidebarExpanded: PropTypes.bool.isRequired,
  setLeftSidebar: PropTypes.func.isRequired,
  leftSidebarComponent: PropTypes.string,
};

const mapStateToProps = state => ({
  isLeftSidebarExpanded: isLeftSidebarExpandedSelector(state),
  leftSidebarComponent: leftSidebarComponentSelector(state),
  mapLegendPanelConfig: leftSidebarPanelConfigSelector(state, "MapLegendPanel"),
});

const mapDispatchToProps = dispatch => ({
  setLeftSidebar: isExpanded => dispatch(setLeftSidebar(isExpanded)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LeftSidebar);
