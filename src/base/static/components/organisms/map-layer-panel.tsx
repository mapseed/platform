/** @jsx jsx */
import * as React from "react";
import { connect } from "react-redux";
import { translate } from "react-i18next";
import { jsx, css } from "@emotion/core";

import { MapSourcesLoadStatus } from "../../state/ducks/map-config";
import {
  leftSidebarPanelConfigSelector,
  LeftSidebarPanel,
} from "../../state/ducks/left-sidebar";
import { SmallTitle } from "../atoms/typography";
import MapLayerPanelSection from "../molecules/map-layer-panel-section";

// These are Props passed down from parent:
type OwnProps = {
  mapSourcesLoadStatus: MapSourcesLoadStatus;
};

// These are Props from Redux:
type StateProps = {
  mapLayerPanelConfig: LeftSidebarPanel;
};

type Props = {
  t: Function;
} & OwnProps &
  StateProps;

const MapLayerPanel: React.FunctionComponent<Props> = props => (
  <div>
    <SmallTitle
      css={css`
        margin-top: 0;
      `}
    >
      {props.t("mapLayerPanelTitle", props.mapLayerPanelConfig.title)}
    </SmallTitle>
    {props.mapLayerPanelConfig.content &&
      props.mapLayerPanelConfig.content.map(
        (section, layerPanelSectionIndex) => (
          <MapLayerPanelSection
            key={section.id}
            layerPanelSectionIndex={layerPanelSectionIndex}
            layerGroupPanels={section.layerGroups}
            mapSourcesLoadStatus={props.mapSourcesLoadStatus}
            title={section.title}
          />
        ),
      )}
  </div>
);

const mapStateToProps = (state: any, ownProps: OwnProps): StateProps => ({
  mapLayerPanelConfig: leftSidebarPanelConfigSelector(state, "MapLayerPanel"),
  ...ownProps,
});

export default connect(mapStateToProps)(
  translate("MapLayerPanel")(MapLayerPanel),
);
