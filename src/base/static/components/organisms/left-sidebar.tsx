/** @jsx jsx */
import * as React from "react";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import { jsx } from "@emotion/core";
import { SmallTitle } from "../atoms/typography";
import { withTranslation, WithTranslation } from "react-i18next";

import { MapSourcesLoadStatus } from "../../state/ducks/map";
import {
  isLeftSidebarExpandedSelector,
  leftSidebarConfigSelector,
  setLeftSidebarExpanded,
  LeftSidebarConfig,
} from "../../state/ducks/left-sidebar";
import LeftSidebarSection from "../molecules/left-sidebar-section";

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
  leftSidebarConfig: LeftSidebarConfig;
} & WithTranslation;

const LeftSidebar: React.FunctionComponent<Props> = props => (
  <section
    css={{
      position: "absolute",
      left: 0,
      zIndex: 6,
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
        overflow: "scroll",
        boxSizing: "border-box",
        "-webkit-overflow-scrolling": "touch",

        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <SmallTitle
        css={{
          marginTop: 0,
        }}
      >
        {props.t("leftSidebarTitle", props.leftSidebarConfig.title)}
      </SmallTitle>

      {props.leftSidebarConfig.sections.length > 0 &&
        props.leftSidebarConfig.sections.map(
          (section, layerPanelSectionIndex) => (
            <LeftSidebarSection
              key={layerPanelSectionIndex}
              section={section}
              layerPanelSectionIndex={layerPanelSectionIndex}
              mapSourcesLoadStatus={props.mapSourcesLoadStatus}
            />
          ),
        )}
    </div>
    <CloseButton onClick={() => props.setLeftSidebarExpanded(false)}>
      &#10005;
    </CloseButton>
  </section>
);

const mapStateToProps = state => ({
  isLeftSidebarExpanded: isLeftSidebarExpandedSelector(state),
  leftSidebarConfig: leftSidebarConfigSelector(state),
});

const mapDispatchToProps = {
  setLeftSidebarExpanded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("LeftSidebar")(LeftSidebar));
