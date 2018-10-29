import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";

import { Image } from "../atoms/imagery";
import { Paragraph, Header4 } from "../atoms/typography";
import MapLegendGroup from "../molecules/map-legend-group";

const MapLegendPanelContainer = styled("div")(props => ({
  padding: 10,
  backgroundColor: props.theme.brand.secondary,
  margin: 0,
}));

const MapLegendPanel = props => {
  return (
    <MapLegendPanelContainer>
      {props.config.title && <Header4>{props.config.title}</Header4>}
      {props.config.description && (
        <Paragraph>{props.config.description}</Paragraph>
      )}
      {props.config.groupings.map((grouping, i) => (
        <MapLegendGroup
          key={i}
          content={grouping.content}
          description={grouping.description}
          title={grouping.title}
        />
      ))}
    </MapLegendPanelContainer>
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
