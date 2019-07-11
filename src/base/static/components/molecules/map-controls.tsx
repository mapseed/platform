/** @jsx jsx */
import * as React from "react";
import { NavigationControl } from "react-map-gl";
import { jsx } from "@emotion/core";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  LeftSidebarConfig,
  leftSidebarConfigSelector,
  setLeftSidebarExpanded,
} from "../../state/ducks/left-sidebar";
import { uiVisibilitySelector, updateUIVisibility } from "../../state/ducks/ui";
import { mapMeasurementToolEnabledSelector } from "../../state/ducks/map-config";

const customControlStatePropTypes = {
  onClickControl: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired,
};

type CustomControlProps = PropTypes.InferProps<
  typeof customControlStatePropTypes
>;

class CustomControl extends React.Component<CustomControlProps> {
  public static defaultProps = {
    icon: "fa-info",
  };

  render() {
    return (
      <div
        className="mapboxgl-ctrl mapboxgl-ctrl-group"
        style={{ marginTop: "8px" }}
      >
        <button
          className={`mapboxgl-ctrl-icon ${this.props.icon}`}
          type="button"
          title="Custom control"
          onClick={this.props.onClickControl}
        />
      </div>
    );
  }
}

type GeolocateControlProps = {
  onViewportChange: Function;
};

// react-map-gl does not export mapboxgl's built-in geolocate control, so we
// need to build our own here.
class GeolocateControl extends React.Component<GeolocateControlProps> {
  onClickGeolocateControl = () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
    navigator.geolocation.getCurrentPosition(position => {
      this.props.onViewportChange({
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      });
    });

    // TODO: Geolocate error handling.
    // TODO: Set zoom on geolocate? Add pulsating marker?
  };

  render() {
    // If geolocation is not supported, do not render the geolocate control.
    // This mirrors the default mapboxgl behavior.
    return "geolocation" in navigator ? (
      <div
        className="mapboxgl-ctrl mapboxgl-ctrl-group"
        style={{ marginTop: "8px" }}
      >
        <button
          className="mapboxgl-ctrl-icon mapboxgl-ctrl-geolocate"
          type="button"
          title="Geolocate"
          onClick={this.onClickGeolocateControl}
        />
      </div>
    ) : null;
  }
}

// These are Props passed down from parent:

const dispatchPropTypes = {
  setLeftSidebarExpanded: PropTypes.func.isRequired,
};

type DispatchProps = PropTypes.InferProps<typeof dispatchPropTypes>;
type ParentProps = {
  onViewportChange: Function;
};

type MapControlStateProps = {
  leftSidebarConfig: LeftSidebarConfig;
};

type MapControlProps = MapControlStateProps & ParentProps & DispatchProps;

const MapControls: React.FunctionComponent<MapControlProps> = props => {
  return (
    <div
      css={{
        position: "absolute",
        top: "8px",
        left: "8px",
      }}
    >
      <NavigationControl
        onViewportChange={viewport => props.onViewportChange(viewport)}
      />
      <GeolocateControl onViewportChange={props.onViewportChange} />
      <CustomControl
        icon={props.leftSidebarConfig.icon}
        onClickControl={() => props.setLeftSidebarExpanded(true)}
      />
      {props.isMapMeasurementToolEnabled && (
        <CustomControl
          icon={"fas fa-ruler-combined"}
          onClickControl={() =>
            props.toggleMapMeasurementToolVisibility(
              !props.isMapMeasurementToolVisible,
            )
          }
        />
      )}
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  setLeftSidebarExpanded: isExpanded =>
    dispatch(setLeftSidebarExpanded(isExpanded)),
  toggleMapMeasurementToolVisibility: isVisible =>
    dispatch(updateUIVisibility("mapMeasurementTool", isVisible)),
});

const mapStateToProps = (state): MapControlStateProps => ({
  leftSidebarConfig: leftSidebarConfigSelector(state),
  isMapMeasurementToolVisible: uiVisibilitySelector(
    "mapMeasurementTool",
    state,
  ),
  isMapMeasurementToolEnabled: mapMeasurementToolEnabledSelector(state),
});

export default connect<MapControlStateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(MapControls);
