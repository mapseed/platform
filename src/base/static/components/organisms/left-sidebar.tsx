/** @jsx jsx */
import * as React from "react";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import { jsx } from "@emotion/core";

import { MapSourcesLoadStatus } from "../../state/ducks/map-config";
import {
  isLeftSidebarExpandedSelector,
  leftSidebarComponentSelector,
  setLeftSidebarExpanded,
} from "../../state/ducks/left-sidebar";
import MapLayerPanel from "./map-layer-panel";

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
  padding: "9px 10px 8px 10px",

  "&:hover": {
    color: "#cd2c67",
    cursor: "pointer",
  },
});

type Props = {
  isLeftSidebarExpanded: boolean;
  mapSourcesLoadStatus: MapSourcesLoadStatus;
  setLeftSidebarExpanded: any;
  leftSidebarComponent: string;
};

const LeftSidebar: React.FunctionComponent<Props> = props => (
  <section
    css={{
      position: "absolute",
      zIndex: 20,
      width: "250px",
      height: "100%",
      boxSizing: "border-box",
      backgroundColor: "#fff",
      lineHeight: "1rem",
      boxShadow: "4px 0px 3px rgba(0,0,0,0.1)",
    }}
  >
    <div
      css={{
        width: "100%",
        height: "100%",
        padding: "1em 1em 4em 1em",
        overflow: "auto",
        boxSizing: "border-box",

        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <CloseButton onClick={() => props.setLeftSidebarExpanded(false)}>
        &#10005;
      </CloseButton>
      {props.leftSidebarComponent === "MapLayerPanel" && (
        <MapLayerPanel mapSourcesLoadStatus={props.mapSourcesLoadStatus} />
      )}
    </div>
  </section>
);

const mapStateToProps = state => ({
  isLeftSidebarExpanded: isLeftSidebarExpandedSelector(state),
  leftSidebarComponent: leftSidebarComponentSelector(state),
});

const mapDispatchToProps = {
  setLeftSidebarExpanded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LeftSidebar);
