import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { Icon, Swatch } from "../atoms/feedback";
import { PanelLabel } from "../atoms/typography";

import "./map-legend-item.scss";

const MapLegendItem = props => (
  <div className="map-legend-item">
    {props.icon && (
      <Icon icon={props.icon} classes="map-legend-item__id-icon" />
    )}
    {props.swatch && <Swatch color={props.swatch} />}
    <PanelLabel classes="map-legend-item__legend-title">
      {props.label}
    </PanelLabel>
  </div>
);

MapLegendItem.propTypes = {
  filterId: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onToggleFilter: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

export default MapLegendItem;
