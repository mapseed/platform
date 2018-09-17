import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { Icon } from "../atoms/feedback";
import "./map-filter-selector.scss";

const MapFilterSelector = props => {
  return (
    <div className="map-filter-selector">
      <span
        className="map-filter-selector__selectable-area"
        onClick={() => props.onToggleFilter(props.filterId)}
      >
        <Icon icon={props.icon} classes="map-filter-selector__id-icon" />
        <span
          className={classNames("map-filter-selector__filter-title", {
            "map-filter-selector__filter-title--selected": props.isSelected,
          })}
        >
          {props.label}
        </span>
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
      </span>
    </div>
  );
};

MapFilterSelector.propTypes = {
  filterId: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onToggleFilter: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

MapFilterSelector.defaultProps = {};

export default MapFilterSelector;
