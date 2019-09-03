/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { useSelector, useDispatch } from "react-redux";

import { LayerGroup } from "../../state/ducks/map-style";
import {
  MapFilterSliderConfig,
  mapFilterSliderConfigSelector,
} from "../../state/ducks/map";
import {
  layerGroupsSelector,
  updateLayerFilters,
} from "../../state/ducks/map-style";
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

const MapFilterSlider: React.FunctionComponent = () => {
  const {
    min,
    max,
    step,
    initialValue,
    comparator,
    property,
    label,
    layerGroupId,
  }: MapFilterSliderConfig = useSelector(mapFilterSliderConfigSelector);
  const layerGroups = useSelector(layerGroupsSelector);
  const layerGroup = layerGroups.byId[layerGroupId];
  const dispatch = useDispatch();
  const [sliderValue, setSliderValue] = React.useState(initialValue);
  React.useEffect(() => {
    buildAndApplyMapLayerFilters({
      filterValue: initialValue,
      layerIds: layerGroup.layerIds,
      comparator,
      property,
      updateLayerFilters: filters => dispatch(updateLayerFilters(filters)),
    });
  }, [initialValue]);

  if (!layerGroup.isVisible) {
    return null;
  }
  return (
    <div
      css={css`
        background-color: rgba(0, 0, 0, 0.6);
        padding: 8px;
        border-radius: 8px;
        color: #fff;
        width: 400px;
        margin-top: 8px;
      `}
    >
      <div
        css={css`
          margin-bottom: 8px;
        `}
      >
        <RegularText>{label}</RegularText>{" "}
        <RegularText weight="black">{sliderValue}</RegularText>
      </div>
      <div
        css={css`
          display: flex;
          align-items: middle;
          justify-content: space-between;
        `}
      >
        <RegularText>{min}</RegularText>
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
          min={min}
          max={max}
          step={step}
          onChange={evt => {
            buildAndApplyMapLayerFilters({
              filterValue: Number(evt.target.value),
              layerIds: layerGroup.layerIds,
              comparator,
              property,
              updateLayerFilters: filters =>
                dispatch(updateLayerFilters(filters)),
            });
            setSliderValue(evt.target.value);
          }}
          value={sliderValue}
        />
        <RegularText>{max}</RegularText>
      </div>
    </div>
  );
};

export default MapFilterSlider;
