import { connect } from "react-redux";
import PropTypes from "prop-types";
import React from "react";
import styled from "react-emotion";

import {
  isLeftSidebarExpandedSelector,
  leftSidebarComponentSelector,
  leftSidebarPanelConfigSelector,
  setLeftSidebarExpanded,
} from "../../state/ducks/left-sidebar";
import MapLayerPanel from "./map-layer-panel";

const LeftSidebarOuterContainer = styled("section")({
  position: "absolute",
  zIndex: 11,
  width: "250px",
  height: "100%",
  boxSizing: "border-box",
  backgroundColor: "#fff",
  lineHeight: "1rem",
  boxShadow: "4px 0px 3px rgba(0,0,0,0.1)",
});

const LeftSidebarInnerContainer = styled("div")({
  width: "100%",
  height: "100%",
  padding: "1em 1em 4em 1em",
  overflow: "auto",
  boxSizing: "border-box",

  "&::-webkit-scrollbar": {
    display: "none",
  },
});

// TODO: Abstract this out into a molecule.
const CloseButton = styled("button")({
  position: "absolute",
  top: "10px",
  right: "-33px",
  borderTopRightRadius: "8px",
  borderBottomRightRadius: "8px",
  backgroundColor: "#fff",
  outline: "none",
  border: "none",
  fontSize: "24px",
  color: "#ff5e99",
  boxShadow: "4px 4px 3px rgba(0,0,0,0.1)",
  padding: "12px 10px 8px 10px",

  "&:hover": {
    color: "#cd2c67",
    cursor: "pointer",
  },
});

const LeftSidebar = props => (
  <LeftSidebarOuterContainer>
    <LeftSidebarInnerContainer>
      <CloseButton onClick={() => props.setLeftSidebarExpanded(false)}>
        &#10005;
      </CloseButton>
      {props.leftSidebarComponent === "MapLayerPanel" && <MapLayerPanel />}
    </LeftSidebarInnerContainer>
  </LeftSidebarOuterContainer>
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
