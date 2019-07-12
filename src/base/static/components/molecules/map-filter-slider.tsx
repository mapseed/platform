/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";

import { LayerGroup } from "../../state/ducks/map";
import { FilterSliderConfig } from "../../state/ducks/map-config";
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

export default MapFilterSlider;
