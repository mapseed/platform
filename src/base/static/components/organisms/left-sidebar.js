import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  leftSidebarExpandedSelector,
  leftSidebarComponentSelector,
} from "../../state/ducks/ui";
import { CloseButton } from "../atoms/navigation";

import MapLayerPanel from "./map-layer-panel";

import "./left-sidebar.scss";

const LeftSidebar = props => {
  return (
    <div className="left-sidebar">
      <CloseButton classes="left-sidebar__close-button" />
      {props.leftSidebarExpanded &&
        props.leftSidebarComponent === "MapLayerPanel" && <MapLayerPanel />}
    </div>
  );
};

LeftSidebar.propTypes = {};

const mapStateToProps = state => ({
  leftSidebarExpanded: leftSidebarExpandedSelector(state),
  leftSidebarComponent: leftSidebarComponentSelector(state),
});

export default connect(mapStateToProps)(LeftSidebar);
