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
    {props.content.map((item, i) => <MapLegendItem key={i} {...item} />)}
  </div>
);

MapLegendGroup.propTypes = {
  content: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      label: PropTypes.string.isRequired,
      swatch: PropTypes.string,
    }),
  ).isRequired,
  title: PropTypes.string,
};

export default MapLegendGroup;
