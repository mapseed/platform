import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import MapGL, { NavigationControl } from "react-map-gl";
import { connect } from "react-redux";
import { fromJS } from "immutable";
import styled from "react-emotion";

import { updateSourceStatus } from "../../state/ducks/map-alt";

import {
  mapStyleSelector,
  mapViewportSelector,
  mapViewportPropType,
  mapStylePropType,
  updateMapViewport,
  sourcesStatusSelector,
} from "../../state/ducks/map-alt";
import { mapOptionsSelector } from "../../state/ducks/map-config";
import {
  leftSidebarConfigSelector,
  setLeftSidebarExpanded,
  setLeftSidebarComponent,
} from "../../state/ducks/left-sidebar";

const MapControlsContainer = styled("div")({
  position: "absolute",
  top: "8px",
  left: "8px",
});

// react-map-gl does not export mapboxgl's built-in geolocate control, so we
// need to build our own here.
class GeolocateControl extends Component {
  onClickGeolocateControl = () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
    navigator.geolocation.getCurrentPosition(position => {
      this.props.updateMapViewport({
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

GeolocateControl.propTypes = {
  updateMapViewport: PropTypes.func.isRequired,
};

class CustomControl extends Component {
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

CustomControl.propTypes = {
  component: PropTypes.string.isRequired,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
  setLeftSidebarComponent: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired,
};

CustomControl.defaultProps = {
  icon: "fa-info",
};

class MainMap extends Component {
  state = {
    // TODO: I think converting to immutable data types is no longer necessary...
    mapStyle: fromJS(this.props.mapStyle),
  };

  mapRef = createRef();

  componentDidMount() {
    this.map = this.mapRef.current.getMap();

    // NOTE: MapboxGL fires many redundant loading events, so only update load
    // status state if a new type of event is fired.
    // TODO: To cut down on the volume of sourcedata events, we could only
    // add sources to MapboxGL if/when they are requested by a layer.
    this.map.on("error", evt => {
      if (this.props.sourcesStatus[evt.sourceId] !== "error") {
        this.props.updateSourceStatus(evt.sourceId, "error");
      }
    });

    this.map.on("sourcedata", evt => {
      const status = this.map.isSourceLoaded(evt.sourceId)
        ? "loaded"
        : "loading";

      if (this.props.sourcesStatus[evt.sourceId] !== status) {
        this.props.updateSourceStatus(evt.sourceId, status);
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.mapStyle.sources !== prevProps.mapStyle.sources) {
      this.setState({
        mapStyle: fromJS(this.props.mapStyle),
      });
    }
  }

  onMapClick = () => {
    console.log("onMapClick");
  };

  onMapLoad = () => {
    console.log("onMapLoad");
  };

  render() {
    return (
      <MapGL
        ref={this.mapRef}
        reuseMaps={true}
        mapOptions={this.props.mapOptions}
        width={this.props.mapViewport.width}
        height={this.props.mapViewport.height}
        latitude={this.props.mapViewport.latitude}
        longitude={this.props.mapViewport.longitude}
        pitch={this.props.mapViewport.pitch}
        bearing={this.props.mapViewport.bearing}
        zoom={this.props.mapViewport.zoom}
        transitionDuration={this.props.mapViewport.transitionDuration}
        transitionInterpolator={this.props.mapViewport.transitionInterpolator}
        transitionEasing={this.props.mapViewport.transitionEasing}
        mapboxApiAccessToken={MAP_PROVIDER_TOKEN}
        onViewportChange={viewport => this.props.updateMapViewport(viewport)}
        mapStyle={this.state.mapStyle}
        onLoad={this.onMapLoad}
        onClick={this.onMapClick}
      >
        <MapControlsContainer>
          <NavigationControl
            onViewportChange={viewport =>
              this.props.updateMapViewport(viewport)
            }
          />
          <GeolocateControl updateMapViewport={this.props.updateMapViewport} />
          {this.props.leftSidebarConfig.panels.map(panel => (
            <CustomControl
              key={panel.id}
              icon={panel.icon}
              component={panel.component}
              setLeftSidebarExpanded={this.props.setLeftSidebarExpanded}
              setLeftSidebarComponent={this.props.setLeftSidebarComponent}
            />
          ))}
        </MapControlsContainer>
      </MapGL>
    );
  }
}

MainMap.propTypes = {
  leftSidebarConfig: PropTypes.shape({
    is_enabled: PropTypes.bool,
    is_visible_default: PropTypes.bool,
    panels: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        title: PropTypes.string,
        groupings: PropTypes.array.isRequired,
      }),
    ),
  }).isRequired,
  mapStyle: mapStylePropType.isRequired,
  mapViewport: mapViewportPropType.isRequired,
  mapOptions: PropTypes.object,
  setLeftSidebarExpanded: PropTypes.func.isRequired,
  setLeftSidebarComponent: PropTypes.func.isRequired,
  sourcesStatus: PropTypes.object.isRequired,
  updateMapViewport: PropTypes.func.isRequired,
  updateSourceStatus: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  leftSidebarConfig: leftSidebarConfigSelector(state),
  mapOptions: mapOptionsSelector(state),
  mapViewport: mapViewportSelector(state),
  mapStyle: mapStyleSelector(state),
  sourcesStatus: sourcesStatusSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setLeftSidebarExpanded: isExpanded =>
    dispatch(setLeftSidebarExpanded(isExpanded)),
  setLeftSidebarComponent: component =>
    dispatch(setLeftSidebarComponent(component)),
  updateMapViewport: viewport => dispatch(updateMapViewport(viewport)),
  updateSourceStatus: (sourceId, status) =>
    dispatch(updateSourceStatus(sourceId, status)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MainMap);
