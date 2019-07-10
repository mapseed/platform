/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { connect } from "react-redux";

import {
  updateLayerFilters,
  LayerGroup,
  LayerGroups,
  layerGroupsSelector,
} from "../../state/ducks/map";
import {
  FilterSliderConfig,
  MapWidgetsConfig,
  mapWidgetsSelector,
} from "../../state/ducks/map-config";
import { layoutSelector } from "../../state/ducks/ui";
import { RangeInput } from "../atoms/input";
import { RegularText } from "../atoms/typography";

const buildAndApplyMapLayerFilters = ({
  filterValue,
  layerIds,
  comparator,
  property,
  updateLayerFilters,
}) => {
  const filters = {
    layerIds,
    filter: [comparator, ["to-number", ["get", property]], filterValue],
  };

  updateLayerFilters(filters);
};

type FilterSliderProps = {
  filterSliderConfig: FilterSliderConfig;
  layerGroup: LayerGroup;
  updateLayerFilters: Function;
};

const MapFilterSlider: React.FunctionComponent<FilterSliderProps> = ({
  filterSliderConfig,
  layerGroup,
  updateLayerFilters,
}) => {
  if (!layerGroup.isVisible) {
    return null;
  }
  const [sliderValue, setSliderValue] = React.useState(
    filterSliderConfig.initialValue,
  );
  React.useEffect(
    () => {
      buildAndApplyMapLayerFilters({
        filterValue: filterSliderConfig.initialValue,
        layerIds: layerGroup.layerIds,
        comparator: filterSliderConfig.comparator,
        property: filterSliderConfig.property,
        updateLayerFilters,
      });
    },
    [filterSliderConfig.initialValue],
  );

  return (
    <div
      css={css`
        background-color: rgba(0, 0, 0, 0.6);
        padding: 8px;
        border-radius: 8px;
        color: #fff;
        margin-top: 8px;
      `}
    >
      <div
        css={css`
          margin-bottom: 8px;
        `}
      >
        <RegularText>{filterSliderConfig.label}</RegularText>{" "}
        <RegularText weight="black">{sliderValue}</RegularText>
      </div>
      <div
        css={css`
          display: flex;
          align-items: middle;
          justify-content: space-between;
        `}
      >
        <RegularText>{filterSliderConfig.min}</RegularText>
        <RangeInput
          css={css`
            width: 100%;
            margin-left: 16px;
            margin-right: 16px;

            &:hover {
              cursor: pointer;
            }

            &:active {
              cursor: grabbing;
            }
          `}
          min={filterSliderConfig.min}
          max={filterSliderConfig.max}
          step={filterSliderConfig.step}
          onChange={evt => {
            buildAndApplyMapLayerFilters({
              filterValue: parseInt(evt.target.value),
              layerIds: layerGroup.layerIds,
              comparator: filterSliderConfig.comparator,
              property: filterSliderConfig.property,
              updateLayerFilters,
            });
            setSliderValue(evt.target.value);
          }}
          value={sliderValue}
        />
        <RegularText>{filterSliderConfig.max}</RegularText>
      </div>
    </div>
  );
};

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
