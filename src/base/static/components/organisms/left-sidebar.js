import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  leftSidebarExpandedSelector,
  leftSidebarComponentSelector,
  setLeftSidebar,
} from "../../state/ducks/ui";
import { CloseButton } from "../atoms/navigation";

import MapLayerPanel from "./map-layer-panel";
import MapFilterPanel from "./map-filter-panel";

import "./left-sidebar.scss";

const LeftSidebar = props => {
  return props.isLeftSidebarExpanded ? (
    <div className="left-sidebar">
      <CloseButton
        classes="left-sidebar__close-button"
        onClick={() => props.setLeftSidebar(false)}
      />
      {props.leftSidebarComponent === "MapLayerPanel" && <MapLayerPanel />}
      {props.leftSidebarComponent === "MapFilterPanel" && <MapFilterPanel />}
    </div>
  ) : null;
};

LeftSidebar.propTypes = {
  isLeftSidebarExpanded: PropTypes.bool.isRequired,
  setLeftSidebar: PropTypes.func.isRequired,
  leftSidebarComponent: PropTypes.string,
};

const mapStateToProps = state => ({
  isLeftSidebarExpanded: leftSidebarExpandedSelector(state),
  leftSidebarComponent: leftSidebarComponentSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setLeftSidebar: isExpanded => dispatch(setLeftSidebar(isExpanded)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LeftSidebar);
