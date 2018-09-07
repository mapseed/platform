import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { Icon, Swatch } from "../atoms/feedback";
import { PanelLabel } from "../atoms/typography";

import "./map-legend-item.scss";

const MapLegendItem = props => (
  <div className="map-legend-item">
    {props.icon && (
      <div className="map-legend-item__icon-container">
        <Icon icon={props.icon} classes="map-legend-item__icon" />
      </div>
    )}
    {props.swatch && <Swatch color={props.swatch} />}
    <PanelLabel classes="map-legend-item__label">{props.label}</PanelLabel>
  </div>
);

MapLegendItem.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string.isRequired,
  swatch: PropTypes.string,
};

export default MapLegendItem;
