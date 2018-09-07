import React from "react";
import PropTypes from "prop-types";

import { Image } from "../atoms/imagery";
import { Paragraph, Header4 } from "../atoms/typography";
import MapLegendGroup from "../molecules/map-legend-group";

import "./map-legend-panel.scss";

const MapLegendPanel = props => {
  return (
    <div className="map-legend-panel">
      {props.config.title && (
        <Header4 classes="map-legend-panel__title">
          {props.config.title}
        </Header4>
      )}
      {props.config.description && (
        <Paragraph classes="map-legend-panel__description">
          {props.config.description}
        </Paragraph>
      )}
      {props.config.groupings.map((grouping, i) => (
        <MapLegendGroup
          key={i}
          content={grouping.content}
          title={grouping.title}
        />
      ))}
    </div>
  );
};

MapLegendPanel.propTypes = {
  config: PropTypes.shape({
    description: PropTypes.string,
    groupings: PropTypes.arrayOf(
      PropTypes.shape({
        content: PropTypes.arrayOf(
          PropTypes.shape({
            icon: PropTypes.string,
            label: PropTypes.string.isRequired,
            swatch: PropTypes.string,
          }),
        ),
        title: PropTypes.string,
      }),
    ),
    title: PropTypes.string,
  }),
};

export default MapLegendPanel;
