/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { useSelector, useDispatch } from "react-redux";

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
import MapWidgetWrapper from "./map-widget-wrapper";

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
  const mapFilterSliderConfig: MapFilterSliderConfig = useSelector(
    mapFilterSliderConfigSelector,
  );

  if (!mapFilterSliderConfig) {
    return null;
  }

  const {
    min,
    max,
    step,
    initialValue,
    comparator,
    property,
    label,
    layerGroupId,
  }: MapFilterSliderConfig = mapFilterSliderConfig;
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
  }, [initialValue, comparator, dispatch, property, layerGroup.layerIds]);

  // TODO: Use Matrial text atoms and tie into themeing passed from
  // MapWidgetWrapper.
  return (
    <MapWidgetWrapper color="black">
      {() => (
        <React.Fragment>
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
        </React.Fragment>
      )}
    </MapWidgetWrapper>
  );
};

export default MapFilterSlider;
