import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { Icon } from "../atoms/feedback";

import "./map-layer-selector.scss";

const MapLayerSelector = props => {
  return (
    <div
      className="map-layer-selector"
      onClick={() => props.onToggleLayer(props.id)}
    >
      <Icon icon={props.icon} classes="map-layer-selector__id-icon" />
      <span
        className={classNames("map-layer-selector__layer-title", {
          "map-layer-selector__layer-title--selected": props.selected,
        })}
      >
        {props.title}
      </span>
      <Icon icon="fa-check" classes="map-layer-selector__status-icon" />
    </div>
  );
};

MapLayerSelector.propTypes = {
  checked: PropTypes.bool,
  group: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onToggleLayer: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

MapLayerSelector.defaultProps = {
  icon: "fa-map-marker",
  type: "layer",
};

export default MapLayerSelector;
