/** @jsx jsx */
import * as React from "react";
import { NavigationControl } from "react-map-gl";
import { jsx } from "@emotion/core";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  leftSidebarConfigPropType,
  leftSidebarConfigSelector,
  setLeftSidebarExpanded,
  setLeftSidebarComponent,
} from "../../state/ducks/left-sidebar";

const customControlStatePropTypes = {
  component: PropTypes.string.isRequired,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
  setLeftSidebarComponent: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired,
};

type CustomControlProps = PropTypes.InferProps<
  typeof customControlStatePropTypes
>;

class CustomControl extends React.Component<CustomControlProps> {
  public static defaultProps = {
    icon: "fa-info",
  };
  onClickControl = () => {
    this.props.setLeftSidebarComponent(this.props.component);
    this.props.setLeftSidebarExpanded(true);
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
          onClick={this.onClickControl}
        />
      </div>
    );
  }
}

const geolocateControlStatePropTypes = {
  onViewportChange: PropTypes.func.isRequired,
};

type GeolocateControlProps = PropTypes.InferProps<
  typeof geolocateControlStatePropTypes
>;

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
const parentPropTypes = {
  onViewportChange: PropTypes.func.isRequired,
};

const mapControlStatePropTypes = {
  leftSidebarConfig: leftSidebarConfigPropType.isRequired,
};

const dispatchPropTypes = {
  setLeftSidebarComponent: PropTypes.func.isRequired,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
};

type DispatchProps = PropTypes.InferProps<typeof dispatchPropTypes>;
type ParentProps = PropTypes.InferProps<typeof parentPropTypes>;

type MapControlStateProps = PropTypes.InferProps<
  typeof mapControlStatePropTypes
>;

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
      {props.leftSidebarConfig.panels.map(panel => (
        <CustomControl
          key={panel.id}
          icon={panel.icon}
          component={panel.component}
          setLeftSidebarComponent={props.setLeftSidebarComponent}
          setLeftSidebarExpanded={props.setLeftSidebarExpanded}
        />
      ))}
    </div>
  );
};

const mapDispatchToProps = {
  setLeftSidebarExpanded,
  setLeftSidebarComponent,
};

const mapStateToProps = (state): MapControlStateProps => ({
  leftSidebarConfig: leftSidebarConfigSelector(state),
});
export default connect<MapControlStateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(MapControls);
