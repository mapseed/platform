import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";

import { HorizontalRule } from "../atoms/misc";
import { Header6, Paragraph } from "../atoms/typography";

import MapLegendItem from "./map-legend-item";

import "./map-legend-group.scss";

const MapLegendGroup = props => (
  <div className={classNames(props.classes, "map-legend-group")}>
    <HorizontalRule classes="map-legend-group__hr" />
    {props.title && (
      <Header6 classes="map-legend-group__title">{props.title}</Header6>
    )}
    {props.description && (
      <Paragraph classes="map-legend-group__description">
        {props.description}
      </Paragraph>
    )}
    {props.content.map((item, i) => (
      <MapLegendItem
        key={i}
        icon={item.icon}
        label={item.label}
        swatch={item.swatch}
      />
    ))}
  </div>
);

MapLegendGroup.propTypes = {
  classes: PropTypes.string,
  content: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      label: PropTypes.string.isRequired,
      swatch: PropTypes.string,
    }),
  ).isRequired,
  description: PropTypes.string,
  title: PropTypes.string,
};

export default MapLegendGroup;
