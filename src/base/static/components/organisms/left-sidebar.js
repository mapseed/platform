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

import "./left-sidebar.scss";

const LeftSidebar = props => {
  return props.leftSidebarExpanded ? (
    <div className="left-sidebar">
      <CloseButton
        classes="left-sidebar__close-button"
        onClick={() => props.setLeftSidebar(false)}
      />
      {props.leftSidebarComponent === "MapLayerPanel" && <MapLayerPanel />}
    </div>
  ) : null;
};

LeftSidebar.propTypes = {
  leftSidebarExpanded: PropTypes.bool.isRequired,
  setLeftSidebar: PropTypes.func.isRequired,
  leftSidebarComponent: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  leftSidebarExpanded: leftSidebarExpandedSelector(state),
  leftSidebarComponent: leftSidebarComponentSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setLeftSidebar: isExpanded => dispatch(setLeftSidebar(isExpanded)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LeftSidebar);
