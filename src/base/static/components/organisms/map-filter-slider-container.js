/** @jsx jsx */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import { connect } from "react-redux";

import {
  filterableLayerGroupMetadataPropType,
  updateLayerFilters,
} from "../../state/ducks/map";
import { RangeInput } from "../atoms/input";
import { RegularText } from "../atoms/typography";

const buildAndApplyMapLayerFilters = ({
  filterValue,
  layerIds,
  comparator,
  property,
  updateLayerFilters,
}) => {
  // Build filters for each Mapbox layer that makes up this layer group.
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
  const [rangeValue, setRangeValue] = useState(filterSlider.initialValue);

  return (
    <div
      css={css`
        display: flex;
        align-items: middle;
        justify-content: space-between;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 8px;
        border-radius: 8px;
        color: #fff;
        margin-top: 8px;
      `}
    >
      <RegularText>{filterSlider.min}</RegularText>
      <RangeInput
        css={css`
          width: 100%;
          margin-left: 16px;
          margin-right: 16px;
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
          setRangeValue(evt.target.value);
        }}
        value={rangeValue}
      />
      <RegularText>{filterSlider.max}</RegularText>
    </div>
  );
};

MapFilterSlider.propTypes = {
  metadata: filterableLayerGroupMetadataPropType,
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
        width: 25%;
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
    filterableLayerGroupMetadataPropType,
  ),
  updateLayerFilters: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  updateLayerFilters: filters => dispatch(updateLayerFilters(filters)),
});

export default connect(
  null,
  mapDispatchToProps,
)(MapFilterSliderContainer);
