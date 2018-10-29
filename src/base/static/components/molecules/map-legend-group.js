import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { HorizontalRule } from "../atoms/layout";
import { Header6, Paragraph } from "../atoms/typography";

import MapLegendItem from "./map-legend-item";

const MapLegendGroup = props => (
  <Fragment>
    {props.title && (
      <Fragment>
        <HorizontalRule />
        <Header6>{props.title}</Header6>
      </Fragment>
    )}
    {props.description && <Paragraph>{props.description}</Paragraph>}
    {props.content.map((item, i) => (
      <MapLegendItem
        key={i}
        icon={item.icon}
        label={item.label}
        swatch={item.swatch}
      />
    ))}
  </Fragment>
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
