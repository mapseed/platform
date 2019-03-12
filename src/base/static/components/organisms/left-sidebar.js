import { connect } from "react-redux";
import PropTypes from "prop-types";
import React from "react";
import styled from "react-emotion";

import { CloseButton } from "../atoms/navigation";
import {
  isLeftSidebarExpandedSelector,
  leftSidebarComponentSelector,
  leftSidebarPanelConfigSelector,
  setLeftSidebarExpanded,
} from "../../state/ducks/left-sidebar";
import MapLayerPanel from "./map-layer-panel";

const LeftSidebarContainer = styled("section")({
  position: "absolute",
  zIndex: 11,
  width: "250px",
  height: "100%",
  overflow: "auto",
  boxSizing: "border-box",
  backgroundColor: "#fff",
  padding: "1em 1em 4em 1em",
  lineHeight: "1rem",
});

const LeftSidebarCloseButton = styled(CloseButton)({
  fontSize: "1.3rem",
  float: "right",
});

const LeftSidebar = props => (
  <LeftSidebarContainer>
    <LeftSidebarCloseButton
      onClick={() => props.setLeftSidebarExpanded(false)}
    />
    {props.leftSidebarComponent === "MapLayerPanel" && <MapLayerPanel />}
  </LeftSidebarContainer>
);

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
