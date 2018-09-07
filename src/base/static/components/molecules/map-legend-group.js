import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";

import { HorizontalRule } from "../atoms/misc";
import { Header6 } from "../atoms/typography";

import MapLegendItem from "./map-legend-item";

import "./map-legend-group.scss";

const MapLegendGroup = props => (
  <div className={classNames(props.classes, "map-legend-group")}>
    <HorizontalRule classes="map-legend-group__hr" />
    <Header6 classes="map-legend-group__title">{props.title}</Header6>
    {props.content.map(item => <MapLegendItem key={item.id} {...item} />)}
  </div>
);

MapLegendGroup.propTypes = {
  classes: PropTypes.string,
  content: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      filter_attribute: PropTypes.string.isRequired,
      filter_value: PropTypes.string.isRequired,
      icon: PropTypes.string,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  featureFilters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      targetLayer: PropTypes.string.isRequired,
      attribute: PropTypes.string.isRequried,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  title: PropTypes.string,
};

export default MapLegendGroup;
