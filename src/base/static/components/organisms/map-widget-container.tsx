/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { connect } from "react-redux";

import {
  updateLayerFilters,
  LayerGroups,
  Layer,
} from "../../state/ducks/map-style";
import { MapWidgetsConfig, mapWidgetsSelector } from "../../state/ducks/map";
import { layoutSelector } from "../../state/ducks/ui";

type ContainerStateProps = {
  layout: string;
  mapWidgets: MapWidgetsConfig;
  layerGroups: LayerGroups;
  layers: Layer[];
};

type DispatchProps = {
  updateLayerFilters: Function;
  updateLayerAggregators: typeof updateLayerAggregators;
};

const getPositionInfo = position => {
  switch (position) {
    case "lower-right":
      return {
        left: "unset",
        right: "8px",
      };
    case "lower-left":
    default:
      return {
        left: "8px",
        right: "unset",
      };
  }
};

type ContainerProps = ContainerStateProps & DispatchProps;
const MapWidgetContainer: React.FunctionComponent<ContainerProps> = props => {
  const positionInfo = getPositionInfo(props.position);

  return (
    <div
      css={css`
        z-index: 8;
        position: absolute;
        bottom: 8px;
        width: 50%;
        right: ${positionInfo.right};
        left: ${positionInfo.left};
      `}
    >
      {props.children}
    </div>
  );
};

//const mapStateToProps = state => ({
//  layout: layoutSelector(state),
//  mapWidgets: mapWidgetsSelector(state),
//  layers: layersSelector(state),
//});

//const mapDispatchToProps = {
//  updateLayerFilters,
//  updateLayerAggregators,
//};

export default MapWidgetContainer;
