/** @jsx jsx */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import { connect } from "react-redux";

import {
  filterableLayerGroupPropType,
  updateLayerFilters,
} from "../../state/ducks/map";
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

const MapFilterSlider = ({
  metadata: { filterSlider, layerIds },
  updateLayerFilters,
}) => {
  const [sliderValue, setSliderValue] = useState(filterSlider.initialValue);
  useEffect(
    () => {
      buildAndApplyMapLayerFilters({
        filterValue: filterSlider.initialValue,
        layerIds,
        comparator: filterSlider.comparator,
        property: filterSlider.property,
        updateLayerFilters,
      });
    },
    [filterSlider.initialValue],
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
        <RegularText>{filterSlider.label}</RegularText>{" "}
        <RegularText weight="black">{sliderValue}</RegularText>
      </div>
      <div
        css={css`
          display: flex;
          align-items: middle;
          justify-content: space-between;
        `}
      >
        <RegularText>{filterSlider.min}</RegularText>
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
          min={filterSlider.min}
          max={filterSlider.max}
          step={filterSlider.step}
          onChange={evt => {
            buildAndApplyMapLayerFilters({
              filterValue: parseInt(evt.target.value),
              layerIds,
              comparator: filterSlider.comparator,
              property: filterSlider.property,
              updateLayerFilters,
            });
            setSliderValue(evt.target.value);
          }}
          value={sliderValue}
        />
        <RegularText>{filterSlider.max}</RegularText>
      </div>
    </div>
  );
};

MapFilterSlider.propTypes = {
  metadata: filterableLayerGroupPropType,
  updateLayerFilters: PropTypes.func.isRequired,
};

const MapFilterSliderContainer = props => {
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
      {props.filterableLayerGroupsMetadata.map((metadata, index) => {
        return (
          <MapFilterSlider
            updateLayerFilters={props.updateLayerFilters}
            key={index}
            metadata={metadata}
          />
        );
      })}
    </div>
  );
};

MapFilterSliderContainer.propTypes = {
  filterableLayerGroupsMetadata: PropTypes.arrayOf(
    filterableLayerGroupPropType,
  ),
  layout: PropTypes.string.isRequired,
  updateLayerFilters: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  layout: layoutSelector(state),
});

const mapDispatchToProps = dispatch => ({
  updateLayerFilters: filters => dispatch(updateLayerFilters(filters)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapFilterSliderContainer);
