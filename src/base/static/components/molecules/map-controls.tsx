/** @jsx jsx */
import * as React from "react";
import { NavigationControl } from "react-map-gl";
import { jsx } from "@emotion/core";
import { connect } from "react-redux";

import {
  LeftSidebarConfig,
  leftSidebarConfigSelector,
  setLeftSidebarExpanded,
} from "../../state/ducks/left-sidebar";
import {
  measurementToolVisibilitySelector,
  updateMeasurementToolVisibility,
} from "../../state/ducks/ui";
import { measurementToolEnabledSelector } from "../../state/ducks/map";
import eventEmitter from "../../utils/event-emitter";

type CustomControlProps = {
  onClick: () => void;
  icon: string;
};

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
          onClick={this.props.onClick}
        />
      </div>
    );
  }
}

type GeolocateControlProps = {
  onViewportChange: any;
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

type DispatchProps = {
  setLeftSidebarExpanded: typeof setLeftSidebarExpanded;
  updateMeasurementToolVisibility: typeof updateMeasurementToolVisibility;
};
type MapControlStateProps = {
  leftSidebarConfig: LeftSidebarConfig;
  isMeasurementToolEnabled: boolean;
  isMeasurementToolVisible: boolean;
};

type MapControlProps = MapControlStateProps & DispatchProps;

const MapControls: React.FunctionComponent<MapControlProps> = props => {
  const setViewport = viewport => {
    eventEmitter.emit("setMapViewport", viewport);
  };
  return (
    <div
      css={{
        position: "absolute",
        top: "8px",
        left: "8px",
      }}
    >
      <NavigationControl onViewportChange={setViewport} />
      <GeolocateControl onViewportChange={setViewport} />
      <CustomControl
        icon={props.leftSidebarConfig.icon}
        onClick={() => props.setLeftSidebarExpanded(true)}
      />
      {props.isMeasurementToolEnabled && (
        <CustomControl
          icon={"fas fa-ruler-combined"}
          onClick={() =>
            props.updateMeasurementToolVisibility(
              !props.isMeasurementToolVisible,
            )
          }
        />
      )}
    </div>
  );
};

const mapStateToProps = (state): MapControlStateProps => ({
  leftSidebarConfig: leftSidebarConfigSelector(state),
  isMeasurementToolVisible: measurementToolVisibilitySelector(state),
  isMeasurementToolEnabled: measurementToolEnabledSelector(state),
});

const mapDispatchToProps = {
  setLeftSidebarExpanded,
  updateMeasurementToolVisibility,
};

export default connect<MapControlStateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(MapControls);
