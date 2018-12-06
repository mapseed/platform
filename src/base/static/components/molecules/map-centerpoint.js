import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";

import { mapCenterpointVisibilitySelector } from "../../state/ducks/ui";
import { mapDraggingSelector } from "../../state/ducks/map";

const MapCenterpointX = styled("span")({
  display: "block",
  position: "absolute",
  width: "18px",
  height: "12px",
  background:
    "transparent url(/static/css/images/marker-x.png) 0 0 no-repeat scroll",
  left: "4px",
  top: "37px",
  transition: "opacity 0.25s",
});

const MapCenterpointShadow = styled("span")(props => ({
  display: "block",
  height: "47px",
  width: "47px",
  position: "absolute",
  top: "0",
  left: "0",
  opacity: props.isMapDragging ? "0.5" : "1",
  background:
    "transparent url(/static/css/images/marker-shadow.png) 0 3px no-repeat scroll",
  backgroundPosition: props.isMapDragging ? "6px -9px" : "0 0",
  transition: "opacity 0s, background-position 0.3s ease",
}));

const MapCenterpointMarker = styled("span")(props => ({
  display: "block",
  width: "25px",
  height: "41px",
  background:
    "transparent url(/static/css/images/marker-plus.png) 0 0 no-repeat scroll",
  position: "relative",
  top: props.isMapDragging ? "-20px" : "3px",
  transition: "top 0.4s ease",
}));

const MapCenterpoint = styled(
  props =>
    props.isMapCenterpointVisible ? (
      <span className={props.className}>
        <MapCenterpointShadow isMapDragging={props.isMapDragging} />
        {props.isMapDragging && <MapCenterpointX />}
        <MapCenterpointMarker isMapDragging={props.isMapDragging} />
      </span>
    ) : null,
)(() => ({
  overflow: "visible",
  position: "absolute",
  top: "50%",
  left: "50%",
  pointerEvents: "none",
  zIndex: "400",
  width: "100px",
  height: "100px",
  margin: "-44px 0 0 -12px",
}));

MapCenterpoint.propTypes = {
  isMapCenterpointVisible: PropTypes.bool.isRequired,
  isMapDragging: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isMapCenterpointVisible: mapCenterpointVisibilitySelector(state),
  isMapDragging: mapDraggingSelector(state),
});

export default connect(mapStateToProps)(MapCenterpoint);
