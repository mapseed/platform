import React from "react";
import PropTypes from "prop-types";

import { Image } from "../atoms/imagery";
import { Paragraph, Header5 } from "../atoms/typography";

import "./map-legend.scss";

const MapLegend = props => {
  return (
    <ul className="map-legend">
      {props.rightSidebarConfig.content.map((item, i) => {
        switch (item.type) {
          case "legend-item":
            return (
              <li className="map-legend__legend-item-container" key={i}>
                <span className="map-legend__icon-container">
                  <Image
                    classes="map-legend__icon"
                    src={item.image}
                    alt="Legend icon image"
                  />
                </span>
                <span className="map-legend__item-title">{item.title}</span>
              </li>
            );
          case "header":
            return (
              <Header5 key={i} classes="map-legend__header">
                {item.content}
              </Header5>
            );

          case "description":
            return (
              <Paragraph key={i} classes="map-legend__description">
                {item.content}
              </Paragraph>
            );
        }
      })}
    </ul>
  );
};

MapLegend.propTypes = {
  rightSidebarConfig: PropTypes.shape({
    content: PropTypes.array,
  }),
};

export default MapLegend;
