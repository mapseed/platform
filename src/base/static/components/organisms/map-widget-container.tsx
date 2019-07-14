/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { connect } from "react-redux";

import MapFilterSlider from "../molecules/map-filter-slider";
import {
  updateLayerFilters,
  LayerGroups,
  layerGroupsSelector,
} from "../../state/ducks/map";
import {
  MapWidgetsConfig,
  mapWidgetsSelector,
} from "../../state/ducks/map-config";
import { layoutSelector } from "../../state/ducks/ui";

type ContainerStateProps = {
  layout: string;
  mapWidgets: MapWidgetsConfig;
  layerGroups: LayerGroups;
};

type DispatchProps = {
  updateLayerFilters: Function;
};

type ContainerProps = ContainerStateProps & DispatchProps;
const MapWidgetContainer: React.FunctionComponent<ContainerProps> = props => {
  if (Object.values(props.mapWidgets).length === 0) {
    return null;
  }
  return (
    <div
      css={css`
        z-index: 8;
        position: absolute;
        bottom: 8px;
        left: 8px;
        right: ${props.layout === "desktop" ? "unset" : "8px"};
        width: ${props.layout === "desktop" ? "400px" : "unset"};
      `}
    >
      {props.mapWidgets.filterSlider && (
        <MapFilterSlider
          updateLayerFilters={props.updateLayerFilters}
          filterSliderConfig={props.mapWidgets.filterSlider}
          layerGroup={
            props.layerGroups.byId[props.mapWidgets.filterSlider.layerGroupId]
          }
        />
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  layout: layoutSelector(state),
  mapWidgets: mapWidgetsSelector(state),
  layerGroups: layerGroupsSelector(state),
});

const mapDispatchToProps = {
  updateLayerFilters,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapWidgetContainer);
