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
  const dispatch = useDispatch();
  const mapFilterSliderConfig: MapFilterSliderConfig[] = useSelector(
    mapFilterSliderConfigSelector,
  );

  const layerGroups = useSelector(layerGroupsSelector);
  const config: MapFilterSliderConfig | undefined = mapFilterSliderConfig.find(
    config =>
      layerGroups.byId[config.layerGroupId] &&
      layerGroups.byId[config.layerGroupId].isVisible,
  );
  const [sliderValue, setSliderValue] = React.useState(
    config && config.initialValue,
  );

  React.useEffect(() => {
    if (config) {
      const layerGroup = layerGroups.byId[config.layerGroupId];
      buildAndApplyMapLayerFilters({
        filterValue: config.initialValue,
        layerIds: layerGroup.layerIds,
        comparator: config.comparator,
        property: config.property,
        updateLayerFilters: filters => dispatch(updateLayerFilters(filters)),
      });
      setSliderValue(config.initialValue);
    }
  }, [dispatch, layerGroups, config]);

  if (!config) {
    return null;
  }

  const layerGroup = layerGroups.byId[config.layerGroupId];
  const {
    min,
    max,
    step,
    comparator,
    property,
    label,
  }: MapFilterSliderConfig = config;

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
