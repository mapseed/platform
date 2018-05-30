import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { leftSidebarConfigSelector } from "../../state/ducks/config";
import {
  leftSidebarExpandedSelector,
  leftSidebarComponentSelector,
} from "../../state/ducks/ui";
import { Header5 } from "../atoms/typography";

import MapLayerManager from "./map-layer-manager";

import "./left-sidebar.scss";

const LeftSidebar = props => {
  console.log(props.leftSidebarConfig);
  console.log(props.leftSidebarExpanded, props.leftSidebarComponent);
  return (
    <div>
      {props.leftSidebarExpanded &&
        props.leftSidebarComponent === "MapLayerManager" && <MapLayerManager />}
    </div>
  );
};

LeftSidebar.propTypes = {};

const mapStateToProps = state => ({
  leftSidebarConfig: leftSidebarConfigSelector(state),
  leftSidebarExpanded: leftSidebarExpandedSelector(state),
  leftSidebarComponent: leftSidebarComponentSelector(state),
});

export default connect(mapStateToProps)(LeftSidebar);
