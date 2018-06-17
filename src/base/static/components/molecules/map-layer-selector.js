import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Spinner from "react-spinner";

import { Icon } from "../atoms/feedback";

import "./map-layer-selector.scss";

const MapLayerSelector = props => {
  let status;
  if (!props.layerStatus) {
    status = "hidden";
  } else {
    status = props.layerStatus.status;
  }

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
      {status === "loading" && props.layerStatus.isVisible ? (
        <div className="map-layer-selector__spinner-container">
          <Spinner />
        </div>
      ) : (
        <Icon
          icon={classNames({
            "fa-check": status === "loaded",
            "fa-times": status === "error",
          })}
          classes={classNames("map-layer-selector__status-icon", {
            "map-layer-selector__status-icon--green": status === "loaded",
            "map-layer-selector__status-icon--red": status === "error",
          })}
        />
      )}
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
