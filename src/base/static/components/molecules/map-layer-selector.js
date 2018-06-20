import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Spinner from "react-spinner";

import emitter from "../../utils/emitter";

import { Icon, InfoModalTrigger } from "../atoms/feedback";
import "./map-layer-selector.scss";

const MapLayerSelector = props => {
  let status;
  if (!props.layerStatus) {
    status = "hidden";
  } else {
    status = props.layerStatus.status;
  }

  return (
    <div className="map-layer-selector">
      <span
        className="map-layer-selector__selectable-area"
        onClick={() => props.onToggleLayer(props.layerId)}
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
      </span>
      <InfoModalTrigger
        classes={classNames("map-layer-selector__info-icon", {
          "map-layer-selector__info-icon--hidden": !(
            props.info.body || props.info.header
          ),
        })}
        modalContent={{
          header: props.info.header,
          body: props.info.body,
        }}
      />
    </div>
  );
};

MapLayerSelector.propTypes = {
  icon: PropTypes.string.isRequired,
  info: PropTypes.object.isRequired,
  layerId: PropTypes.string.isRequired,
  layerStatus: PropTypes.shape({
    isVisible: PropTypes.bool,
    isBasemap: PropTypes.bool,
    status: PropTypes.string,
  }),
  onToggleLayer: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
};

MapLayerSelector.defaultProps = {
  icon: "fa-map-marker",
  info: {},
  type: "layer",
};

export default MapLayerSelector;
