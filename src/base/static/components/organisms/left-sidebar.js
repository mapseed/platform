import { connect } from "react-redux";
import PropTypes from "prop-types";
import React from "react";

import { CloseButton } from "../atoms/navigation";
import {
  isLeftSidebarExpandedSelector,
  leftSidebarComponentSelector,
  leftSidebarPanelConfigSelector,
  setLeftSidebarExpanded,
} from "../../state/ducks/left-sidebar";
import MapFilterPanel from "./map-filter-panel";
import MapLayerPanel from "./map-layer-panel";

import "./left-sidebar.scss";

const LeftSidebar = props => {
  return props.isLeftSidebarExpanded ? (
    <div className="left-sidebar">
      <CloseButton
        classes="left-sidebar__close-button"
        onClick={() => props.setLeftSidebarExpanded(false)}
      />
      {props.leftSidebarComponent === "MapLayerPanel" && <MapLayerPanel />}
      {props.leftSidebarComponent === "MapFilterPanel" && <MapFilterPanel />}
    </div>
  ) : null;
};

LeftSidebar.propTypes = {
  isLeftSidebarExpanded: PropTypes.bool.isRequired,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
  leftSidebarComponent: PropTypes.string,
  mapLegendPanelConfig: PropTypes.shape({
    component: PropTypes.string.isRequired,
    icon: PropTypes.string,
    title: PropTypes.string,
    groupings: PropTypes.arrayOf(
      PropTypes.shape({
        content: PropTypes.arrayOf(
          PropTypes.shape({
            icon: PropTypes.string,
            label: PropTypes.string.isRequired,
            swatch: PropTypes.string,
          }),
        ),
        title: PropTypes.string,
      }),
    ).isRequired,
  }),
};

const mapStateToProps = state => ({
  isLeftSidebarExpanded: isLeftSidebarExpandedSelector(state),
  leftSidebarComponent: leftSidebarComponentSelector(state),
  mapLegendPanelConfig: leftSidebarPanelConfigSelector(state, "MapLegendPanel"),
});

const mapDispatchToProps = dispatch => ({
  setLeftSidebarExpanded: isExpanded =>
    dispatch(setLeftSidebarExpanded(isExpanded)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LeftSidebar);
