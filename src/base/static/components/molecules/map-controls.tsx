/** @jsx jsx */
import * as React from "react";
import {
  NavigationControl,
  GeolocateControl,
  GeolocateControlProps,
} from "react-map-gl";
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

// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/38417
// TODO: Remove this when react-map-gl's types are updated.
declare module "react-map-gl" {
  export interface GeolocateControlProps {
    style?: React.CSSProperties;
  }
}

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
      <GeolocateControl
        trackUserLocation={true}
        positionOptions={{ enableHighAccuracy: true, timeout: 6000 }}
        style={{
          marginTop: "8px",
        }}
      />
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
