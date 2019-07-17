/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { connect } from "react-redux";

import MapFilterSlider from "../molecules/map-filter-slider";
import MapRadioMenu from "../molecules/map-radio-menu";
import {
  updateLayerFilters,
  updateLayerAggregators,
  LayerGroups,
  layerGroupsSelector,
  layersSelector,
  Layer,
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
  layers: Layer[];
};

type DispatchProps = {
  updateLayerFilters: Function;
  updateLayerAggregators: typeof updateLayerAggregators;
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
      <React.Fragment>
        {props.mapWidgets.filterSlider && (
          <MapFilterSlider
            updateLayerFilters={props.updateLayerFilters}
            filterSliderConfig={props.mapWidgets.filterSlider}
            layerGroup={
              props.layerGroups.byId[props.mapWidgets.filterSlider.layerGroupId]
            }
          />
        )}
        {props.mapWidgets.radioMenu && (
          <MapRadioMenu
            radioMenuConfig={props.mapWidgets.radioMenu}
            updateLayerAggregators={props.updateLayerAggregators}
            layerGroups={props.layerGroups}
            layers={props.layers}
          />
        )}
      </React.Fragment>
    </div>
  );
};

const mapStateToProps = state => ({
  layout: layoutSelector(state),
  mapWidgets: mapWidgetsSelector(state),
  layerGroups: layerGroupsSelector(state),
  layers: layersSelector(state),
});

const mapDispatchToProps = {
  updateLayerFilters,
  updateLayerAggregators,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapWidgetContainer);
